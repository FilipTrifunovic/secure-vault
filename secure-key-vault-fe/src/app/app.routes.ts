import { Routes } from '@angular/router';
import { authGuard } from './auth/auth.guard';
import { loginRedirectGuard } from './auth/login-redirect.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./auth/login/login').then((m) => m.Login),
    canActivate: [loginRedirectGuard],
  },
  {
    path: 'callback',
    loadComponent: () => import('./auth/callback/callback').then((m) => m.Callback),
  },
  {
    path: 'vault',
    loadChildren: () =>
      import('./vault/vault.routes').then((m) => m.VAULT_ROUTES),
    canActivate: [authGuard],
  },
  { path: '', redirectTo: 'vault', pathMatch: 'full' },
  { path: '**', redirectTo: 'vault' },
];
