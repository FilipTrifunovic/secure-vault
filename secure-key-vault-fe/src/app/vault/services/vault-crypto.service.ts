import { inject, Injectable } from '@angular/core';
import { IndexedDbService } from '../../shared/services/indexed-db.service';

@Injectable({ providedIn: 'root' })
export class VaultCryptoService {
  private indexedDb = inject(IndexedDbService);

  private symmetricKey: CryptoKey | null = null;
  private readonly ALGORITHM = 'AES-GCM';
  private readonly VERIFICATION_TOKEN = 'vault_verification_v1';
  private readonly KEY_LENGTH = 256;
  private readonly PBKDF2_ITERATIONS = 100000;

  get isUnlocked(): boolean {
    return this.symmetricKey !== null;
  }

  async deriveKeyFromMasterPassword(masterPassword: string, salt: Uint8Array): Promise<CryptoKey> {
    const encoder = new TextEncoder();
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      encoder.encode(masterPassword),
      'PBKDF2',
      false,
      ['deriveKey']
    );

    return crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: salt as BufferSource,
        iterations: this.PBKDF2_ITERATIONS,
        hash: 'SHA-256',
      },
      keyMaterial,
      { name: this.ALGORITHM, length: this.KEY_LENGTH },
      true,
      ['encrypt', 'decrypt']
    );
  }

  async setupVault(
    masterPassword: string,
    userId: string
  ): Promise<{ encryptedVaultKey: string; iv: string }> {
    const salt = new TextEncoder().encode(userId.padEnd(16, '0').slice(0, 16));

    this.symmetricKey = await this.deriveKeyFromMasterPassword(masterPassword, salt);

    const verificationPlaintext = new TextEncoder().encode(this.VERIFICATION_TOKEN);
    const verificationIv = crypto.getRandomValues(new Uint8Array(12));
    const verificationCiphertext = await crypto.subtle.encrypt(
      { name: this.ALGORITHM, iv: verificationIv },
      this.symmetricKey,
      verificationPlaintext
    );
    await this.indexedDb.saveItem(`vaultVerification_${userId}`, {
      encryptedData: this.arrayBufferToBase64(new Uint8Array(verificationCiphertext)),
      iv: this.arrayBufferToBase64(verificationIv),
    });

    const exported = await crypto.subtle.exportKey('raw', this.symmetricKey);
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const encrypted = await crypto.subtle.encrypt(
      { name: this.ALGORITHM, iv },
      this.symmetricKey,
      exported
    );

    return {
      encryptedVaultKey: this.arrayBufferToBase64(new Uint8Array(encrypted)),
      iv: this.arrayBufferToBase64(iv),
    };
  }

  async unlockVault(masterPassword: string, userId: string): Promise<boolean> {
    try {
      const salt = new TextEncoder().encode(userId.padEnd(16, '0').slice(0, 16));
      const derivedKey = await this.deriveKeyFromMasterPassword(masterPassword, salt);

      const verification = await this.indexedDb.getItem<{ encryptedData: string; iv: string }>(
        `vaultVerification_${userId}`
      );
      if (!verification) {
        return false;
      }

      const ciphertext = this.base64ToArrayBuffer(verification.encryptedData);
      const ivBytes = new Uint8Array(this.base64ToArrayBuffer(verification.iv));
      const plaintext = await crypto.subtle.decrypt(
        { name: this.ALGORITHM, iv: ivBytes },
        derivedKey,
        ciphertext
      );
      const token = new TextDecoder().decode(plaintext);
      if (token !== this.VERIFICATION_TOKEN) {
        return false;
      }

      this.symmetricKey = derivedKey;
      return true;
    } catch {
      this.symmetricKey = null;
      return false;
    }
  }

  async hasLocalVerification(userId: string): Promise<boolean> {
    const verification = await this.indexedDb.getItem<{ encryptedData: string; iv: string }>(
      `vaultVerification_${userId}`
    );
    return verification !== null;
  }

  lockVault(): void {
    this.symmetricKey = null;
  }

  async encryptEntry(data: object): Promise<{ encryptedData: string; iv: string }> {
    if (!this.symmetricKey) throw new Error('Vault is locked');

    const plaintext = new TextEncoder().encode(JSON.stringify(data));
    const iv = crypto.getRandomValues(new Uint8Array(12));

    const ciphertext = await crypto.subtle.encrypt(
      { name: this.ALGORITHM, iv },
      this.symmetricKey,
      plaintext
    );

    return {
      encryptedData: this.arrayBufferToBase64(new Uint8Array(ciphertext)),
      iv: this.arrayBufferToBase64(iv),
    };
  }

  async decryptEntry(encryptedData: string, iv: string): Promise<object> {
    if (!this.symmetricKey) throw new Error('Vault is locked');

    const ciphertext = this.base64ToArrayBuffer(encryptedData);
    const ivBytes = new Uint8Array(this.base64ToArrayBuffer(iv));

    const plaintext = await crypto.subtle.decrypt(
      { name: this.ALGORITHM, iv: ivBytes },
      this.symmetricKey,
      ciphertext
    );

    return JSON.parse(new TextDecoder().decode(plaintext));
  }

  private arrayBufferToBase64(buffer: Uint8Array): string {
    let binary = '';
    for (let i = 0; i < buffer.byteLength; i++) {
      binary += String.fromCharCode(buffer[i]);
    }
    return btoa(binary);
  }

  private base64ToArrayBuffer(base64: string): ArrayBuffer {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes.buffer;
  }
}
