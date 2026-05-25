import { ChangeDetectionStrategy, Component, EventEmitter, inject, Output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { VaultState } from '../../../../services/vault.state';
import { VaultExportService } from '../../../../services/vault-export.service';

@Component({
  selector: 'app-export-dialog',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './export-dialog.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExportDialog {
  @Output() close = new EventEmitter<void>();

  private vaultState = inject(VaultState);
  private exportService = inject(VaultExportService);

  exportFormat = signal<'encrypted' | 'json'>('encrypted');
  exporting = signal(false);
  success = signal(false);
  error = signal<string | null>(null);

  entryCount = this.vaultState.entryCount;
  folderCount = () => this.vaultState.folders().length;

  async export(): Promise<void> {
    this.exporting.set(true);
    this.error.set(null);

    try {
      const entries = this.vaultState.entries();
      const folders = this.vaultState.folders();
      const encrypted = this.exportFormat() === 'encrypted';

      const blob = encrypted
        ? await this.exportService.exportAsEncrypted(entries, folders)
        : this.exportService.exportAsJson(entries, folders);

      const filename = this.exportService.generateFilename(encrypted);
      this.exportService.downloadFile(blob, filename);

      this.success.set(true);
      setTimeout(() => this.close.emit(), 1500);
    } catch (err) {
      this.error.set(err instanceof Error ? err.message : 'Export failed');
    } finally {
      this.exporting.set(false);
    }
  }

  onBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) this.close.emit();
  }
}
