import { Routes } from '@angular/router';
import { VaultState } from './services/vault.state';
import { vaultReadyGuard, vaultSetupGuard, vaultUnlockGuard } from './guards/vault-ready.guard';

export const VAULT_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/vault-dashboard/vault-dashboard').then((m) => m.VaultDashboard),
    canActivate: [vaultReadyGuard],
    providers: [VaultState],
  },
  {
    path: 'setup',
    loadComponent: () =>
      import('./pages/vault-setup/vault-setup').then((m) => m.VaultSetup),
    canActivate: [vaultSetupGuard],
    providers: [VaultState],
  },
  {
    path: 'unlock',
    loadComponent: () =>
      import('./pages/vault-unlock/vault-unlock').then((m) => m.VaultUnlock),
    canActivate: [vaultUnlockGuard],
    providers: [VaultState],
  },
];
