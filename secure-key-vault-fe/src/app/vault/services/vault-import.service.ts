import { inject, Injectable } from '@angular/core';
import { VaultCryptoService } from './vault-crypto.service';
import {
  DecryptedVaultEntry,
  EntryType,
  FolderDto,
  LoginEntry,
} from '../models/vault.models';
import { VaultExport } from './vault-export.service';

export type ImportFormat = 'securevault' | 'securevault-encrypted' | 'bitwarden' | 'lastpass';

export interface ImportResult {
  entries: DecryptedVaultEntry[];
  folders: string[];
  format: ImportFormat;
}

interface BitwardenRow {
  folder: string;
  favorite: string;
  type: string;
  name: string;
  notes: string;
  fields: string;
  login_uri: string;
  login_username: string;
  login_password: string;
  login_totp: string;
}

interface LastPassRow {
  url: string;
  username: string;
  password: string;
  extra: string;
  name: string;
  grouping: string;
  fav: string;
}

@Injectable({ providedIn: 'root' })
export class VaultImportService {
  private crypto = inject(VaultCryptoService);

  async parseFile(file: File): Promise<ImportResult> {
    const content = await file.text();
    const ext = file.name.split('.').pop()?.toLowerCase();

    if (ext === 'csv') {
      return this.parseCsv(content);
    }

    const json = JSON.parse(content);

    if (json.encrypted && json.data && json.iv) {
      return this.parseEncryptedBackup(json);
    }

    if (json.version && json.entries) {
      return this.parseSecureVaultBackup(json as VaultExport);
    }

    throw new Error('Unsupported file format');
  }

  private parseCsv(content: string): ImportResult {
    const lines = this.parseCsvLines(content);
    if (lines.length < 2) throw new Error('CSV file is empty');

    const headers = lines[0].map((h) => h.toLowerCase().trim());
    const format = this.detectCsvFormat(headers);
    const entries: DecryptedVaultEntry[] = [];
    const folderSet = new Set<string>();

    for (let i = 1; i < lines.length; i++) {
      const row = lines[i];
      if (row.length < headers.length) continue;

      const record: Record<string, string> = {};
      headers.forEach((h, idx) => (record[h] = row[idx] || ''));

      const entry =
        format === 'bitwarden'
          ? this.mapBitwardenEntry(record as unknown as BitwardenRow)
          : this.mapLastPassEntry(record as unknown as LastPassRow);

      if (entry) {
        entries.push(entry);
        const folder = format === 'bitwarden' ? record['folder'] : record['grouping'];
        if (folder) folderSet.add(folder);
      }
    }

    return { entries, folders: Array.from(folderSet), format };
  }

  private parseCsvLines(content: string): string[][] {
    const lines: string[][] = [];
    let current: string[] = [];
    let field = '';
    let inQuotes = false;

    for (let i = 0; i < content.length; i++) {
      const char = content[i];
      const next = content[i + 1];

      if (inQuotes) {
        if (char === '"' && next === '"') {
          field += '"';
          i++;
        } else if (char === '"') {
          inQuotes = false;
        } else {
          field += char;
        }
      } else {
        if (char === '"') {
          inQuotes = true;
        } else if (char === ',') {
          current.push(field);
          field = '';
        } else if (char === '\n' || (char === '\r' && next === '\n')) {
          current.push(field);
          if (current.some((f) => f.trim())) lines.push(current);
          current = [];
          field = '';
          if (char === '\r') i++;
        } else if (char !== '\r') {
          field += char;
        }
      }
    }

    if (field || current.length) {
      current.push(field);
      if (current.some((f) => f.trim())) lines.push(current);
    }

    return lines;
  }

  private detectCsvFormat(headers: string[]): ImportFormat {
    const headerSet = new Set(headers);
    if (headerSet.has('login_uri') || headerSet.has('login_username')) {
      return 'bitwarden';
    }
    if (headerSet.has('grouping') || (headerSet.has('url') && headerSet.has('extra'))) {
      return 'lastpass';
    }
    return 'bitwarden';
  }

  private mapBitwardenEntry(row: BitwardenRow): DecryptedVaultEntry | null {
    if (!row.name && !row.login_username && !row.login_uri) return null;

    const data: LoginEntry = {
      url: row.login_uri || '',
      username: row.login_username || '',
      password: row.login_password || '',
      notes: row.notes || '',
      totp: row.login_totp || undefined,
    };

    return {
      id: crypto.randomUUID(),
      entryType: EntryType.Login,
      data,
      folderId: undefined,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  private mapLastPassEntry(row: LastPassRow): DecryptedVaultEntry | null {
    if (!row.name && !row.username && !row.url) return null;

    const data: LoginEntry = {
      url: row.url || '',
      username: row.username || '',
      password: row.password || '',
      notes: row.extra || '',
    };

    return {
      id: crypto.randomUUID(),
      entryType: EntryType.Login,
      data,
      folderId: undefined,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  private parseSecureVaultBackup(backup: VaultExport): ImportResult {
    const entries = backup.entries.map((e) => ({
      ...e,
      id: crypto.randomUUID(),
      createdAt: new Date(e.createdAt),
      updatedAt: new Date(e.updatedAt),
      folderId: undefined,
    }));

    return {
      entries,
      folders: backup.folders.map((f) => f.name),
      format: 'securevault',
    };
  }

  private async parseEncryptedBackup(json: {
    data: string;
    iv: string;
  }): Promise<ImportResult> {
    const decrypted = (await this.crypto.decryptEntry(json.data, json.iv)) as VaultExport;
    return {
      ...this.parseSecureVaultBackup(decrypted),
      format: 'securevault-encrypted',
    };
  }

  isDuplicate(
    entry: DecryptedVaultEntry,
    existing: DecryptedVaultEntry[],
    folders: FolderDto[]
  ): boolean {
    if (entry.entryType !== EntryType.Login) return false;
    const data = entry.data as LoginEntry;
    return existing.some((e) => {
      if (e.entryType !== EntryType.Login) return false;
      const eData = e.data as LoginEntry;
      return eData.url === data.url && eData.username === data.username;
    });
  }
}
