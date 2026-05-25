import { TestBed } from '@angular/core/testing';
import { VaultCryptoService } from './vault-crypto.service';
import { IndexedDbService } from '../../shared/services/indexed-db.service';

const mockIndexedDb = {
  saveItem: vi.fn().mockResolvedValue(undefined),
  getItem: vi.fn().mockResolvedValue(null),
};

describe('VaultCryptoService', () => {
  let service: VaultCryptoService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        VaultCryptoService,
        { provide: IndexedDbService, useValue: mockIndexedDb },
      ],
    });
    service = TestBed.inject(VaultCryptoService);
  });

  it('should create', () => {
    expect(service).toBeTruthy();
  });

  it('isUnlocked returns false initially', () => {
    expect(service.isUnlocked).toBe(false);
  });

  it('should derive a CryptoKey from a master password', async () => {
    const salt = new TextEncoder().encode('testuserid000000');
    const key = await service.deriveKeyFromMasterPassword('MySecret123!', salt);
    expect(key).toBeInstanceOf(CryptoKey);
    expect(key.algorithm.name).toBe('AES-GCM');
  });

  it('should produce different keys for different passwords', async () => {
    const salt = new TextEncoder().encode('testuserid000000');
    const key1 = await service.deriveKeyFromMasterPassword('Password1', salt);
    const key2 = await service.deriveKeyFromMasterPassword('Password2', salt);
    const raw1 = await crypto.subtle.exportKey('raw', key1);
    const raw2 = await crypto.subtle.exportKey('raw', key2);
    expect(new Uint8Array(raw1)).not.toEqual(new Uint8Array(raw2));
  });

  it('should throw when encrypting with a locked vault', async () => {
    service.lockVault();
    await expect(service.encryptEntry({ test: 'data' })).rejects.toThrow('Vault is locked');
  });

  it('should encrypt and decrypt an entry roundtrip after deriving a key', async () => {
    const salt = new TextEncoder().encode('testuserid000000');
    const password = 'TestMaster!1';
    const userId = 'testuserid000000';

    const derivedKey = await service.deriveKeyFromMasterPassword(password, salt);
    const verificationPlaintext = new TextEncoder().encode('vault_verification_v1');
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const ciphertext = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, derivedKey, verificationPlaintext);

    mockIndexedDb.getItem.mockResolvedValue({
      encryptedData: btoa(String.fromCharCode(...new Uint8Array(ciphertext))),
      iv: btoa(String.fromCharCode(...iv)),
    });

    const unlocked = await service.unlockVault(password, userId);
    expect(unlocked).toBe(true);
    expect(service.isUnlocked).toBe(true);

    const original = { url: 'https://example.com', username: 'user', password: 'secret' };
    const { encryptedData, iv: entryIv } = await service.encryptEntry(original);
    expect(encryptedData).toBeTruthy();

    const decrypted = await service.decryptEntry(encryptedData, entryIv);
    expect(decrypted).toEqual(original);
  });
});
