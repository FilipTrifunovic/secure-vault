import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { VaultState } from '../../../../services/vault.state';
import { PasswordGeneratorService } from '../../../../services/password-generator.service';
import {
  CreditCardEntry,
  EntryData,
  EntryType,
  IdentityEntry,
  LoginEntry,
  SecureNoteEntry,
} from '../../../../models/vault.models';

const EMAIL_RE =
  /^(?=.{1,254}$)(?=.{1,64}@)[A-Za-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[A-Za-z0-9!#$%&'*+/=?^_`{|}~-]+)*@[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?(?:\.[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?)*$/;

@Component({
  selector: 'app-entry-form',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './entry-form.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EntryForm implements OnInit {
  private state = inject(VaultState);
  private pwGen = inject(PasswordGeneratorService);

  EntryType = EntryType;
  entryType = signal(EntryType.Login);
  saving = signal(false);
  error = signal<string | null>(null);

  emailError = signal<string | null>(null);
  cardNumberError = signal<string | null>(null);
  expMonthError = signal<string | null>(null);
  expYearError = signal<string | null>(null);
  cvvError = signal<string | null>(null);

  // Login fields
  url = signal('');
  username = signal('');
  password = signal('');
  notes = signal('');

  // SecureNote fields
  noteTitle = signal('');
  noteContent = signal('');

  // CreditCard fields
  cardholderName = signal('');
  cardNumber = signal('');
  expMonth = signal('');
  expYear = signal('');
  cvv = signal('');
  cardNotes = signal('');

  // Identity fields
  firstName = signal('');
  lastName = signal('');
  email = signal('');
  phone = signal('');
  address = signal('');

  editing = this.state.editingEntry;
  folders = this.state.folders;
  selectedFolderId = signal<string | undefined>(undefined);

  ngOnInit(): void {
    const entry = this.editing();
    if (entry) {
      this.entryType.set(entry.entryType);
      this.selectedFolderId.set(entry.folderId);
      this.populateFields(entry.entryType, entry.data);
    }
  }

  private populateFields(type: EntryType, data: EntryData): void {
    switch (type) {
      case EntryType.Login: {
        const d = data as LoginEntry;
        this.url.set(d.url || '');
        this.username.set(d.username || '');
        this.password.set(d.password || '');
        this.notes.set(d.notes || '');
        break;
      }
      case EntryType.SecureNote: {
        const d = data as SecureNoteEntry;
        this.noteTitle.set(d.title || '');
        this.noteContent.set(d.content || '');
        break;
      }
      case EntryType.CreditCard: {
        const d = data as CreditCardEntry;
        this.cardholderName.set(d.cardholderName || '');
        this.cardNumber.set(d.number || '');
        this.expMonth.set(d.expMonth || '');
        this.expYear.set(d.expYear || '');
        this.cvv.set(d.cvv || '');
        this.cardNotes.set(d.notes || '');
        break;
      }
      case EntryType.Identity: {
        const d = data as IdentityEntry;
        this.firstName.set(d.firstName || '');
        this.lastName.set(d.lastName || '');
        this.email.set(d.email || '');
        this.phone.set(d.phone || '');
        this.address.set(d.address || '');
        break;
      }
    }
  }

  generatePassword(): void {
    const pw = this.pwGen.generate(this.pwGen.getDefaultOptions());
    this.password.set(pw);
  }

  close(): void {
    this.state.showEntryForm.set(false);
    this.state.editingEntry.set(null);
  }

  async save(): Promise<void> {
    this.saving.set(true);
    this.error.set(null);

    if (!this.validate()) {
      this.saving.set(false);
      return;
    }

    try {
      const data = this.buildEntryData();
      const editing = this.editing();

      if (editing) {
        await this.state.updateEntry(editing.id, this.entryType(), data, this.selectedFolderId());
      } else {
        await this.state.createEntry(this.entryType(), data, this.selectedFolderId());
      }
    } catch (err) {
      this.error.set(err instanceof Error ? err.message : 'Failed to save');
    } finally {
      this.saving.set(false);
    }
  }

  onDigitBeforeInput(event: InputEvent): void {
    if (event.data && /\D/.test(event.data)) {
      event.preventDefault();
    }
  }

  onEmailBlur(): void {
    const e = this.email().trim();
    if (!e) {
      this.emailError.set(null);
      return;
    }
    this.emailError.set(EMAIL_RE.test(e) ? null : 'Please enter a valid email address');
  }

  onCardNumberBlur(): void {
    const v = this.cardNumber();
    if (!v) {
      this.cardNumberError.set(null);
      return;
    }
    this.cardNumberError.set(v.length === 16 ? null : 'Card number must be 16 digits');
  }

  onExpMonthBlur(): void {
    const v = this.expMonth();
    if (!v) {
      this.expMonthError.set(null);
      return;
    }
    const m = parseInt(v, 10);
    this.expMonthError.set(
      v.length === 2 && m >= 1 && m <= 12 ? null : 'Month must be 01-12',
    );
  }

  onExpYearBlur(): void {
    const v = this.expYear();
    if (!v) {
      this.expYearError.set(null);
      return;
    }
    this.expYearError.set(v.length === 2 ? null : 'Year must be 2 digits');
  }

  onCvvBlur(): void {
    const v = this.cvv();
    if (!v) {
      this.cvvError.set(null);
      return;
    }
    this.cvvError.set(v.length === 3 ? null : 'CVV must be 3 digits');
  }

  private validate(): boolean {
    this.emailError.set(null);
    this.cardNumberError.set(null);
    this.expMonthError.set(null);
    this.expYearError.set(null);
    this.cvvError.set(null);

    const type = this.entryType();
    let ok = true;

    if (type === EntryType.Identity) {
      const e = this.email().trim();
      if (e && !EMAIL_RE.test(e)) {
        this.emailError.set('Please enter a valid email address');
        ok = false;
      }
    }

    if (type === EntryType.CreditCard) {
      if (this.cardNumber().length !== 16) {
        this.cardNumberError.set('Card number must be 16 digits');
        ok = false;
      }
      const m = parseInt(this.expMonth(), 10);
      if (this.expMonth().length !== 2 || isNaN(m) || m < 1 || m > 12) {
        this.expMonthError.set('Month must be 01-12');
        ok = false;
      }
      if (this.expYear().length !== 2) {
        this.expYearError.set('Year must be 2 digits');
        ok = false;
      }
      if (this.cvv().length !== 3) {
        this.cvvError.set('CVV must be 3 digits');
        ok = false;
      }
    }

    return ok;
  }

  private buildEntryData(): EntryData {
    switch (this.entryType()) {
      case EntryType.Login:
        return {
          url: this.url(),
          username: this.username(),
          password: this.password(),
          notes: this.notes() || undefined,
        } as LoginEntry;
      case EntryType.SecureNote:
        return {
          title: this.noteTitle(),
          content: this.noteContent(),
        } as SecureNoteEntry;
      case EntryType.CreditCard:
        return {
          cardholderName: this.cardholderName(),
          number: this.cardNumber(),
          expMonth: this.expMonth(),
          expYear: this.expYear(),
          cvv: this.cvv(),
          notes: this.cardNotes() || undefined,
        } as CreditCardEntry;
      case EntryType.Identity:
        return {
          firstName: this.firstName(),
          lastName: this.lastName(),
          email: this.email(),
          phone: this.phone() || undefined,
          address: this.address() || undefined,
        } as IdentityEntry;
    }
  }

  onBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) this.close();
  }
}
