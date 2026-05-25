import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { VaultState } from '../../../../services/vault.state';
import { DecryptedVaultEntry, EntryType, getEntryTitle, getEntrySubtitle } from '../../../../models/vault.models';
import { ToastService } from '../../../../../shared/services/toast.service';

@Component({
  selector: 'app-entry-list',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './entry-list.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EntryList {
  state = inject(VaultState);
  private toast = inject(ToastService);

  entries = this.state.filteredEntries;
  loading = this.state.loading;
  searchQuery = this.state.searchQuery;

  getTitle = getEntryTitle;
  getSubtitle = getEntrySubtitle;

  selectEntry(entry: DecryptedVaultEntry): void {
    this.state.selectedEntry.set(entry);
    this.state.showEntryForm.set(false);
  }

  editEntry(entry: DecryptedVaultEntry, event: Event): void {
    event.stopPropagation();
    this.state.selectedEntry.set(entry);
    this.state.editingEntry.set(entry);
    this.state.showEntryForm.set(true);
  }

  async deleteEntry(entry: DecryptedVaultEntry, event: Event): Promise<void> {
    event.stopPropagation();
    try {
      await this.state.deleteEntry(entry.id);
    } catch {
      this.toast.error('Failed to delete entry');
    }
  }

  onSearch(event: Event): void {
    this.state.searchQuery.set((event.target as HTMLInputElement).value);
  }

  getTypeIcon(type: EntryType): string {
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

  getTypeColor(type: EntryType): string {
    switch (type) {
      case EntryType.Login: return 'text-indigo-400 bg-indigo-500/20';
      case EntryType.SecureNote: return 'text-emerald-400 bg-emerald-500/20';
      case EntryType.CreditCard: return 'text-amber-400 bg-amber-500/20';
      case EntryType.Identity: return 'text-purple-400 bg-purple-500/20';
    }
  }
}
