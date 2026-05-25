import { inject, Injectable } from '@angular/core';
import { VaultCryptoService } from './vault-crypto.service';
import { DecryptedVaultEntry, FolderDto } from '../models/vault.models';

export interface VaultExport {
  version: '1.0';
  exportedAt: string;
  entries: DecryptedVaultEntry[];
  folders: FolderDto[];
}

@Injectable({ providedIn: 'root' })
export class VaultExportService {
  private crypto = inject(VaultCryptoService);

  exportAsJson(entries: DecryptedVaultEntry[], folders: FolderDto[]): Blob {
    const exportData: VaultExport = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      entries,
      folders,
    };
    return new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
  }

  async exportAsEncrypted(entries: DecryptedVaultEntry[], folders: FolderDto[]): Promise<Blob> {
    const exportData: VaultExport = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      entries,
      folders,
    };
    const { encryptedData, iv } = await this.crypto.encryptEntry(exportData);
    const encrypted = { encrypted: true, data: encryptedData, iv };
    return new Blob([JSON.stringify(encrypted)], { type: 'application/json' });
  }

  downloadFile(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  generateFilename(encrypted: boolean): string {
    const date = new Date().toISOString().split('T')[0];
    return `securevault-backup-${date}.${encrypted ? 'enc' : 'json'}`;
  }
}
