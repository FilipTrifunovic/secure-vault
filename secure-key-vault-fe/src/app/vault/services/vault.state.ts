import { computed, inject, Injectable, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { VaultApiService } from './vault-api.service';
import { VaultCryptoService } from './vault-crypto.service';
import { AuthService } from '../../auth/auth.service';
import { ToastService } from '../../shared/services/toast.service';
import {
  DecryptedVaultEntry,
  EntryData,
  EntryType,
  FolderDto,
  VaultEntryDto,
} from '../models/vault.models';

@Injectable()
export class VaultState {
  private api = inject(VaultApiService);
  private crypto = inject(VaultCryptoService);
  private auth = inject(AuthService);
  private toast = inject(ToastService);

  entries = signal<DecryptedVaultEntry[]>([]);
  folders = signal<FolderDto[]>([]);
  loading = signal(false);
  vaultSetup = signal(false);
  selectedFolderId = signal<string | null>(null);
  searchQuery = signal('');
  selectedEntry = signal<DecryptedVaultEntry | null>(null);
  showEntryForm = signal(false);
  editingEntry = signal<DecryptedVaultEntry | null>(null);

  isUnlocked = computed(() => this.crypto.isUnlocked);
  entryCount = computed(() => this.entries().length);

  filteredEntries = computed(() => {
    let result = this.entries();
    const folderId = this.selectedFolderId();
    const query = this.searchQuery().toLowerCase();

    if (folderId) {
      result = result.filter((e) => e.folderId === folderId);
    }

    if (query) {
      result = result.filter((e) => {
        const data = JSON.stringify(e.data).toLowerCase();
        return data.includes(query);
      });
    }

    return result;
  });

  async setupVault(masterPassword: string): Promise<void> {
    const userId = this.auth.userId();
    const { encryptedVaultKey, iv } = await this.crypto.setupVault(masterPassword, userId);
    await firstValueFrom(this.api.setupVault(encryptedVaultKey, iv));
    this.vaultSetup.set(true);
  }

  async unlockVault(masterPassword: string): Promise<boolean> {
    const userId = this.auth.userId();
    const success = await this.crypto.unlockVault(masterPassword, userId);
    if (success) {
      await this.loadEntries();
    }
    return success;
  }

  lockVault(): void {
    this.crypto.lockVault();
    this.entries.set([]);
    this.folders.set([]);
    this.selectedEntry.set(null);
    this.toast.info('Vault locked');
  }

  async loadEntries(): Promise<void> {
    this.loading.set(true);
    try {
      const [rawEntries, rawFolders] = await Promise.all([
        firstValueFrom(this.api.listEntries()),
        firstValueFrom(this.api.listFolders()),
      ]);

      const decrypted = await this.decryptEntries(rawEntries);
      this.entries.set(decrypted);
      this.folders.set(rawFolders);
    } finally {
      this.loading.set(false);
    }
  }

  async createEntry(entryType: EntryType, data: EntryData, folderId?: string): Promise<void> {
    const { encryptedData, iv } = await this.crypto.encryptEntry(data);
    const { id } = await firstValueFrom(this.api.createEntry(entryType, encryptedData, iv, folderId));

    const newEntry: DecryptedVaultEntry = {
      id,
      entryType,
      data,
      folderId,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.entries.update((entries) => [newEntry, ...entries]);
    this.showEntryForm.set(false);
    this.toast.success('Entry created');
  }

  async updateEntry(id: string, entryType: EntryType, data: EntryData, folderId?: string): Promise<void> {
    const { encryptedData, iv } = await this.crypto.encryptEntry(data);
    await firstValueFrom(this.api.updateEntry(id, entryType, encryptedData, iv, folderId));

    this.entries.update((entries) =>
      entries.map((e) =>
        e.id === id ? { ...e, entryType, data, folderId, updatedAt: new Date() } : e
      )
    );

    this.editingEntry.set(null);
    this.showEntryForm.set(false);
    if (this.selectedEntry()?.id === id) {
      this.selectedEntry.update((e) => (e ? { ...e, entryType, data, folderId, updatedAt: new Date() } : null));
    }
    this.toast.success('Entry updated');
  }

  async deleteEntry(id: string): Promise<void> {
    await firstValueFrom(this.api.deleteEntry(id));
    this.entries.update((entries) => entries.filter((e) => e.id !== id));
    if (this.selectedEntry()?.id === id) {
      this.selectedEntry.set(null);
    }
    this.toast.success('Entry deleted');
  }

  async createFolder(name: string, parentFolderId?: string): Promise<void> {
    const { id } = await firstValueFrom(this.api.createFolder(name, parentFolderId));
    this.folders.update((f) => [...f, { id, name, parentFolderId, createdAt: new Date().toISOString() }]);
    this.toast.success('Folder created');
  }

  async updateFolder(id: string, name: string): Promise<void> {
    await firstValueFrom(this.api.updateFolder(id, name));
    this.folders.update((f) => f.map((folder) => (folder.id === id ? { ...folder, name } : folder)));
  }

  async deleteFolder(id: string): Promise<void> {
    await firstValueFrom(this.api.deleteFolder(id));
    this.folders.update((f) => f.filter((folder) => folder.id !== id));
    if (this.selectedFolderId() === id) {
      this.selectedFolderId.set(null);
    }
    this.toast.success('Folder deleted');
  }

  private async decryptEntries(raw: VaultEntryDto[]): Promise<DecryptedVaultEntry[]> {
    const decrypted: DecryptedVaultEntry[] = [];

    for (const entry of raw) {
      try {
        const data = (await this.crypto.decryptEntry(entry.encryptedData, entry.iv)) as EntryData;
        decrypted.push({
          id: entry.id,
          entryType: entry.entryType,
          data,
          folderId: entry.folderId,
          createdAt: new Date(entry.createdAt),
          updatedAt: new Date(entry.updatedAt),
        });
      } catch {
        // Skip entries that fail to decrypt (corrupted or wrong key)
      }
    }

    return decrypted;
  }
}
