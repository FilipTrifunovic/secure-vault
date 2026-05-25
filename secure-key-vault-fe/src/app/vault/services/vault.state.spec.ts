import { TestBed } from '@angular/core/testing';
import { VaultState } from './vault.state';
import { VaultApiService } from './vault-api.service';
import { VaultCryptoService } from './vault-crypto.service';
import { AuthService } from '../../auth/auth.service';
import { ToastService } from '../../shared/services/toast.service';
import { DecryptedVaultEntry, EntryType } from '../models/vault.models';

const mockEntries: DecryptedVaultEntry[] = [
  {
    id: '1',
    entryType: EntryType.Login,
    data: { url: 'https://github.com', username: 'alice', password: 'secret' },
    folderId: 'folder-a',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '2',
    entryType: EntryType.SecureNote,
    data: { title: 'My Note', content: 'Some private text' },
    folderId: 'folder-b',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '3',
    entryType: EntryType.Login,
    data: { url: 'https://example.com', username: 'bob', password: 'hunter2' },
    folderId: 'folder-a',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

describe('VaultState — filteredEntries', () => {
  let state: VaultState;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        VaultState,
        { provide: VaultApiService, useValue: {} },
        { provide: VaultCryptoService, useValue: { isUnlocked: true } },
        { provide: AuthService, useValue: { userId: () => 'user-1' } },
        { provide: ToastService, useValue: { success: () => {}, error: () => {}, info: () => {} } },
      ],
    });
    state = TestBed.inject(VaultState);
    state.entries.set(mockEntries);
  });

  it('should return all entries when no filter is active', () => {
    expect(state.filteredEntries()).toHaveLength(3);
  });

  it('should filter by folderId', () => {
    state.selectedFolderId.set('folder-a');
    const result = state.filteredEntries();
    expect(result).toHaveLength(2);
    expect(result.every((e) => e.folderId === 'folder-a')).toBe(true);
  });

  it('should filter by search query (case-insensitive)', () => {
    state.searchQuery.set('GITHUB');
    const result = state.filteredEntries();
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('1');
  });

  it('should combine folder and search filters', () => {
    state.selectedFolderId.set('folder-a');
    state.searchQuery.set('bob');
    const result = state.filteredEntries();
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('3');
  });

  it('should return empty array when nothing matches', () => {
    state.searchQuery.set('nonexistent-xyz');
    expect(state.filteredEntries()).toHaveLength(0);
  });
});
