# SecureVault API

ASP.NET Core 6 backend for SecureVault — a zero-knowledge password manager. Built with Clean Architecture, CQRS via MediatR, EF Core + SQLite, and JWT/OIDC authentication.

## Prerequisites

- .NET 6 SDK
- Docker (optional)

## Getting Started

```bash
dotnet restore
dotnet run --project src/WebUI
# API → http://localhost:5000
```

Or with Docker:

```bash
docker-compose up --build
```

## API Endpoints

### Vault
- `POST /api/vault/setup` — store encrypted vault key
- `POST /api/vault/entries` — create encrypted entry
- `GET /api/vault/entries` — list entries
- `GET /api/vault/entries/{id}` — get entry
- `PUT /api/vault/entries/{id}` — update entry
- `DELETE /api/vault/entries/{id}` — delete entry
- `POST /api/vault/entries/{id}/share` — share entry
- `GET /api/vault/shared` — list shared entries

### Folders
- `POST /api/folders` — create folder
- `GET /api/folders` — list folders
- `PUT /api/folders/{id}` — update folder
- `DELETE /api/folders/{id}` — delete folder

### Users
- `GET /api/users/search?email=` — search users
- `POST /api/users/public-key` — register RSA public key
- `GET /api/users/{id}/public-key` — get user's public key
