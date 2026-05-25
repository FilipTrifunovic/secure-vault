import { ChangeDetectionStrategy, Component, EventEmitter, inject, Output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { VaultState } from '../../../../services/vault.state';
import { VaultImportService, ImportFormat, ImportResult } from '../../../../services/vault-import.service';
import { DecryptedVaultEntry, EntryType, getEntryTitle } from '../../../../models/vault.models';

@Component({
  selector: 'app-import-dialog',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './import-dialog.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ImportDialog {
  @Output() close = new EventEmitter<void>();

  private vaultState = inject(VaultState);
  private importService = inject(VaultImportService);

  step = signal<'select' | 'preview' | 'importing' | 'done'>('select');
  importResult = signal<ImportResult | null>(null);
  createFolders = signal(true);
  skipDuplicates = signal(false);
  importing = signal(false);
  error = signal<string | null>(null);
  progress = signal(0);
  importedCount = signal(0);
  skippedCount = signal(0);

  getTitle = getEntryTitle;
  EntryType = EntryType;

  formatLabels: Record<ImportFormat, string> = {
    securevault: 'SecureVault JSON',
    'securevault-encrypted': 'SecureVault Encrypted',
    bitwarden: 'Bitwarden CSV',
    lastpass: 'LastPass CSV',
  };

  async onFileSelect(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    this.error.set(null);

    try {
      const result = await this.importService.parseFile(file);
      this.importResult.set(result);
      this.step.set('preview');
    } catch (err) {
      this.error.set(err instanceof Error ? err.message : 'Failed to parse file');
    }
  }

  async import(): Promise<void> {
    const result = this.importResult();
    if (!result) return;

    this.step.set('importing');
    this.importing.set(true);
    this.error.set(null);

    try {
      const existingEntries = this.vaultState.entries();
      const existingFolders = this.vaultState.folders();
      const folderMap = new Map<string, string>();

      // Create folders first
      if (this.createFolders()) {
        for (const folderName of result.folders) {
          const existing = existingFolders.find((f) => f.name === folderName);
          if (existing) {
            folderMap.set(folderName, existing.id);
          } else {
            await this.vaultState.createFolder(folderName);
            const created = this.vaultState.folders().find((f) => f.name === folderName);
            if (created) folderMap.set(folderName, created.id);
          }
        }
      }

      let imported = 0;
      let skipped = 0;
      const total = result.entries.length;

      for (let i = 0; i < result.entries.length; i++) {
        const entry = result.entries[i];

        if (this.skipDuplicates() && this.importService.isDuplicate(entry, existingEntries, existingFolders)) {
          skipped++;
          this.skippedCount.set(skipped);
          continue;
        }

        await this.vaultState.createEntry(entry.entryType, entry.data, entry.folderId);
        imported++;
        this.importedCount.set(imported);
        this.progress.set(Math.round(((i + 1) / total) * 100));
      }

      this.step.set('done');
    } catch (err) {
      this.error.set(err instanceof Error ? err.message : 'Import failed');
      this.step.set('preview');
    } finally {
      this.importing.set(false);
    }
  }

  getEntryIcon(type: EntryType): string {
    switch (type) {
      case EntryType.Login:
        return 'M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z';
      case EntryType.SecureNote:
        return 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z';
      case EntryType.CreditCard:
        return 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z';
      case EntryType.Identity:
        return 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z';
    }
  }

  getProgressWidthClass(): string {
    const step = Math.round(this.progress() / 10) * 10;
    return `progress-w-${Math.min(step, 100)}`;
  }

  onBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) this.close.emit();
  }
}
