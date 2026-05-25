import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../auth/auth.service';
import { VaultState } from '../../services/vault.state';
import { EntryList } from './components/entry-list/entry-list';
import { EntryForm } from './components/entry-form/entry-form';
import { EntryDetail } from './components/entry-detail/entry-detail';
import { PasswordGeneratorWidget } from './components/password-generator/password-generator';
import { FolderTree } from './components/folder-tree/folder-tree';
import { ExportDialog } from './components/export-dialog/export-dialog';
import { ImportDialog } from './components/import-dialog/import-dialog';
import { AnimatedBackground } from '../../../shared/components/animated-background/animated-background';

@Component({
  selector: 'app-vault-dashboard',
  standalone: true,
  imports: [EntryList, EntryForm, EntryDetail, PasswordGeneratorWidget, FolderTree, ExportDialog, ImportDialog, AnimatedBackground],
  templateUrl: './vault-dashboard.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VaultDashboard implements OnInit {
  private auth = inject(AuthService);
  private router = inject(Router);
  state = inject(VaultState);

  username = this.auth.username;
  entryCount = this.state.entryCount;
  folderCount = computed(() => this.state.folders().length);

  showExportDialog = signal(false);
  showImportDialog = signal(false);

  icons = {
    entries: 'M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z',
    folders: 'M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z',
    lock: 'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z',
  };

  ngOnInit(): void {
    if (!this.state.isUnlocked()) {
      this.router.navigate(['/vault/unlock']);
      return;
    }
    this.state.loadEntries();
  }

  lockVault(): void {
    this.state.lockVault();
    this.router.navigate(['/vault/unlock']);
  }

  openNewEntry(): void {
    this.state.editingEntry.set(null);
    this.state.showEntryForm.set(true);
  }

  openExport(): void {
    this.showExportDialog.set(true);
  }

  openImport(): void {
    this.showImportDialog.set(true);
  }

  closeExport(): void {
    this.showExportDialog.set(false);
  }

  closeImport(): void {
    this.showImportDialog.set(false);
    this.state.loadEntries();
  }
}
