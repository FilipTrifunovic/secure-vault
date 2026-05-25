export enum EntryType {
  Login = 0,
  SecureNote = 1,
  CreditCard = 2,
  Identity = 3,
}

export interface LoginEntry {
  url: string;
  username: string;
  password: string;
  notes?: string;
  totp?: string;
}

export interface SecureNoteEntry {
  title: string;
  content: string;
}

export interface CreditCardEntry {
  cardholderName: string;
  number: string;
  expMonth: string;
  expYear: string;
  cvv: string;
  notes?: string;
}

export interface IdentityEntry {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  address?: string;
}

export type EntryData = LoginEntry | SecureNoteEntry | CreditCardEntry | IdentityEntry;

export interface VaultEntryDto {
  id: string;
  entryType: EntryType;
  encryptedData: string;
  iv: string;
  folderId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DecryptedVaultEntry {
  id: string;
  entryType: EntryType;
  data: EntryData;
  folderId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface FolderDto {
  id: string;
  name: string;
  parentFolderId?: string;
  createdAt: string;
}

export function getEntryTitle(entry: DecryptedVaultEntry): string {
  switch (entry.entryType) {
    case EntryType.Login:
      return (entry.data as LoginEntry).url || (entry.data as LoginEntry).username || 'Login';
    case EntryType.SecureNote:
      return (entry.data as SecureNoteEntry).title || 'Note';
    case EntryType.CreditCard:
      return (entry.data as CreditCardEntry).cardholderName || 'Card';
    case EntryType.Identity:
      const id = entry.data as IdentityEntry;
      return `${id.firstName} ${id.lastName}`.trim() || 'Identity';
  }
}

export function getEntrySubtitle(entry: DecryptedVaultEntry): string {
  switch (entry.entryType) {
    case EntryType.Login:
      return (entry.data as LoginEntry).username || '';
    case EntryType.SecureNote:
      return 'Secure Note';
    case EntryType.CreditCard: {
      const card = entry.data as CreditCardEntry;
      return card.number ? `****${card.number.slice(-4)}` : '';
    }
    case EntryType.Identity:
      return (entry.data as IdentityEntry).email || '';
  }
}
