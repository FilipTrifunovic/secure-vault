import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../shared/environment';
import { EntryType, FolderDto, VaultEntryDto } from '../models/vault.models';

@Injectable({ providedIn: 'root' })
export class VaultApiService {
  private http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/vault`;
  private readonly foldersUrl = `${environment.apiUrl}/folders`;

  getVaultStatus(): Observable<{ isSetup: boolean }> {
    return this.http.get<{ isSetup: boolean }>(`${this.baseUrl}/status`);
  }

  setupVault(encryptedVaultKey: string, iv: string): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/setup`, { encryptedVaultKey, iv });
  }

  listEntries(): Observable<VaultEntryDto[]> {
    return this.http.get<VaultEntryDto[]>(`${this.baseUrl}/entries`);
  }

  getEntry(id: string): Observable<VaultEntryDto> {
    return this.http.get<VaultEntryDto>(`${this.baseUrl}/entries/${id}`);
  }

  createEntry(entryType: EntryType, encryptedData: string, iv: string, folderId?: string): Observable<{ id: string }> {
    return this.http.post<{ id: string }>(`${this.baseUrl}/entries`, {
      entryType,
      encryptedData,
      iv,
      folderId,
    });
  }

  updateEntry(id: string, entryType: EntryType, encryptedData: string, iv: string, folderId?: string): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/entries/${id}`, {
      entryType,
      encryptedData,
      iv,
      folderId,
    });
  }

  deleteEntry(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/entries/${id}`);
  }

  listFolders(): Observable<FolderDto[]> {
    return this.http.get<FolderDto[]>(this.foldersUrl);
  }

  createFolder(name: string, parentFolderId?: string): Observable<{ id: string }> {
    return this.http.post<{ id: string }>(this.foldersUrl, { name, parentFolderId });
  }

  updateFolder(id: string, name: string, parentFolderId?: string): Observable<void> {
    return this.http.put<void>(`${this.foldersUrl}/${id}`, { name, parentFolderId });
  }

  deleteFolder(id: string): Observable<void> {
    return this.http.delete<void>(`${this.foldersUrl}/${id}`);
  }
}
