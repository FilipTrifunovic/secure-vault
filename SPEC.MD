# SPEC.MD -- SecureVault: Zero-Knowledge Password Manager (Diploma Project)

## Project Overview

**Project Name:** SecureVault

| Layer    | Stack                                                                                              |
| -------- | -------------------------------------------------------------------------------------------------- |
| Frontend | Angular 21, Tailwind CSS 4, standalone signals, Web Crypto API                                     |
| Backend  | ASP.NET Core 6, Clean Architecture (Domain / Application / Infrastructure / WebUI), EF Core + SQLite |

### Purpose

This project is developed as part of a diploma thesis. The goal is to demonstrate practical implementation of:

- Zero-knowledge password vault with client-side AES-256-GCM encryption
- Master password key derivation (PBKDF2 + HKDF)
- OAuth2 + OpenID Connect authentication with Identity Server
- Modern Angular development with standalone signals
- Clean Architecture principles in backend
- Secure database operations using EF Core + SQLite

> All code must be documented and structured to support a diploma report.

---

## 1. Architecture: Zero-Knowledge Model

### 1.1 Key Derivation

1. **Master Password** + salt -> PBKDF2 (100,000 iterations, SHA-256) -> **Master Key**
2. **Master Key** -> HKDF stretch -> **Symmetric Key** (AES-256-GCM)
3. **Symmetric Key** is wrapped (encrypted) with user's RSA-OAEP public key -> stored on server as `EncryptedVaultKey`
4. RSA private key stored only in browser IndexedDB (never leaves client)

### 1.2 Vault Entry Encryption

- Each vault entry is JSON-serialized, then encrypted with the Symmetric Key using AES-256-GCM
- Server stores: base64-encoded ciphertext + IV per entry
- Server never sees plaintext credentials

### 1.3 Sharing Model

- Owner decrypts Symmetric Key with their RSA private key
- Re-encrypts the entry's data key with recipient's RSA public key
- Recipient decrypts with their RSA private key

---

## 2. Vault Entry Types

| Type        | Fields                                                      |
| ----------- | ----------------------------------------------------------- |
| Login       | url, username, password, notes?, totp?                      |
| SecureNote  | title, content                                              |
| CreditCard  | cardholderName, number, expMonth, expYear, cvv, notes?      |
| Identity    | firstName, lastName, email, phone?, address?                 |

---

## 3. Frontend Specifications

### 3.1 Directory Structure

```
secure-key-vault-fe/src/app/
 +-- auth/                    # OAuth2/OIDC login, logout, token handling
 +-- vault/                   # Vault pages, components, services
 |   +-- services/            # vault-api, vault-crypto, vault.state, password-generator
 |   +-- pages/               # vault-dashboard, vault-setup, vault-unlock
 |   +-- components/          # entry-list, entry-form, entry-detail, password-generator, folder-tree, share-dialog
 |   +-- models/              # vault.models.ts
 |   +-- vault.routes.ts
 +-- core/                    # KeyManagement, IndexedDB, UserApi services
 +-- shared/                  # Environment config
 +-- app.routes.ts
```

### 3.2 Key Requirements

- Angular 21 with standalone components
- Tailwind CSS 4 for all styling
- Standalone signals for state management
- Authentication via Identity Server (OIDC / OAuth2)
- All encryption performed client-side via Web Crypto API

### 3.3 Vault Module

**Location:** `vault/`

**Responsibilities:**

- Master password setup (first login) and unlock (returning user)
- CRUD operations on vault entries (Login, SecureNote, CreditCard, Identity)
- Client-side encryption/decryption of vault entries using AES-256-GCM
- Folder organization for entries
- Password generator with configurable length, character sets
- Share entries with other users via RSA key exchange
- Search/filter entries
- State management via Angular signals

### 3.4 State Management

- Use signals for reactive state
- Track:
  - Authenticated user state
  - Vault lock/unlock state
  - Vault entries (encrypted on server, decrypted in memory)
  - Folders
  - Password generator settings

---

## 4. Backend Specifications

**Project:** `secure-key-vault-api`
**Architecture:** Clean Architecture (Domain / Application / Infrastructure / WebUI)

### 4.1 Core Layers

| Layer          | Responsibility                              |
| -------------- | ------------------------------------------- |
| Domain         | Entities, Value Objects, Enums               |
| Application    | Commands, Queries (CQRS via MediatR)         |
| Infrastructure | EF Core (SQLite), services                   |
| WebUI          | Controllers, API endpoints                   |

### 4.2 API Endpoints

#### Vault Management

| Endpoint                        | Method   | Description                          |
| ------------------------------- | -------- | ------------------------------------ |
| `/api/vault/setup`              | `POST`   | Store encrypted vault key            |
| `/api/vault/entries`            | `POST`   | Create encrypted vault entry         |
| `/api/vault/entries`            | `GET`    | List user's encrypted entries        |
| `/api/vault/entries/{id}`       | `GET`    | Get single encrypted entry           |
| `/api/vault/entries/{id}`       | `PUT`    | Update encrypted entry               |
| `/api/vault/entries/{id}`       | `DELETE` | Delete entry                         |
| `/api/vault/entries/{id}/share` | `POST`   | Share entry with another user        |
| `/api/vault/shared`             | `GET`    | List entries shared with me          |

#### Folder Management

| Endpoint                        | Method   | Description                          |
| ------------------------------- | -------- | ------------------------------------ |
| `/api/folders`                  | `POST`   | Create folder                        |
| `/api/folders`                  | `GET`    | List user's folders                  |
| `/api/folders/{id}`             | `PUT`    | Update folder                        |
| `/api/folders/{id}`             | `DELETE` | Delete folder                        |

#### User Management (unchanged)

| Endpoint                        | Method   | Description                          |
| ------------------------------- | -------- | ------------------------------------ |
| `/api/users/search`             | `GET`    | Search users by email                |
| `/api/users/public-key`         | `POST`   | Register RSA public key              |
| `/api/users/{id}/public-key`    | `GET`    | Get user's public key                |

### 4.3 Database

- SQLite using EF Core
- Tables:
  - **Users** (Id, Email, PublicKey, EncryptedVaultKey, VaultKeyIv)
  - **VaultEntries** (Id, UserId, EntryType, EncryptedData, Iv, FolderId?, CreatedAt, UpdatedAt)
  - **Folders** (Id, UserId, Name, ParentFolderId?, CreatedAt)
  - **SharedEntries** (Id, EntryId, OwnerId, RecipientId, EncryptedKey, SharedAt)
- Encryption keys never stored in DB; only encrypted blobs

### 4.4 Security Requirements

- Backend never sees plaintext vault data
- Only encrypted entries stored
- Enforce authorization checks (user can only access own entries)
- Input validation on all endpoints

---

## 5. Functional Requirements (Summary)

### 5.1 Frontend

- User login/logout with OAuth2/OIDC
- Master password setup and vault unlock
- CRUD vault entries (Login, SecureNote, CreditCard, Identity)
- Client-side AES-256-GCM encryption/decryption
- Folder organization
- Password generator
- Share entries with other users
- Search/filter entries
- Responsive UI with Tailwind CSS 4
- Standalone signals for state

### 5.2 Backend

- Vault entry CRUD endpoints (encrypted data only)
- Folder CRUD endpoints
- JWT/OIDC token validation
- Store only encrypted data
- SQLite + EF Core
- Clean Architecture compliance

---

## 6. Diploma Thesis Notes

- Project must include documentation:
  - Architecture diagrams (frontend/backend)
  - Zero-knowledge encryption flow
  - Key derivation chain (Master Password -> PBKDF2 -> HKDF -> AES key)
  - OAuth2/OIDC authentication flow
  - Signal-based state management explanation
- All code must be commented, explaining security decisions
- The thesis should include both theoretical and practical implementation
- Frontend and backend must be fully functional, demonstrable for thesis defense
