import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { VaultState } from '../../../../services/vault.state';
import {
  CreditCardEntry,
  EntryType,
  getEntryTitle,
  IdentityEntry,
  LoginEntry,
  SecureNoteEntry,
} from '../../../../models/vault.models';

@Component({
  selector: 'app-entry-detail',
  standalone: true,
  imports: [DatePipe],
  templateUrl: './entry-detail.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EntryDetail {
  state = inject(VaultState);

  EntryType = EntryType;
  entry = this.state.selectedEntry;
  showPassword = signal(false);
  showTotp = signal(false);
  showCvv = signal(false);
  showCardNumber = signal(false);
  copied = signal<string | null>(null);
  deleting = signal(false);

  getTitle = getEntryTitle;

  get login(): LoginEntry | null {
    const e = this.entry();
    return e?.entryType === EntryType.Login ? (e.data as LoginEntry) : null;
  }

  get note(): SecureNoteEntry | null {
    const e = this.entry();
    return e?.entryType === EntryType.SecureNote ? (e.data as SecureNoteEntry) : null;
  }

  get card(): CreditCardEntry | null {
    const e = this.entry();
    return e?.entryType === EntryType.CreditCard ? (e.data as CreditCardEntry) : null;
  }

  get identity(): IdentityEntry | null {
    const e = this.entry();
    return e?.entryType === EntryType.Identity ? (e.data as IdentityEntry) : null;
  }

  close(): void {
    this.state.selectedEntry.set(null);
  }

  edit(): void {
    this.state.editingEntry.set(this.entry());
    this.state.showEntryForm.set(true);
  }

  async delete(): Promise<void> {
    const entry = this.entry();
    if (!entry) return;
    this.deleting.set(true);
    try {
      await this.state.deleteEntry(entry.id);
    } finally {
      this.deleting.set(false);
    }
  }

  async copy(value: string, label: string): Promise<void> {
    await navigator.clipboard.writeText(value);
    this.copied.set(label);
    setTimeout(() => this.copied.set(null), 2000);
  }

  onBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) this.close();
  }
}
