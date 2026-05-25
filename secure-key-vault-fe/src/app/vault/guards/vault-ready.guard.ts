import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { VaultApiService } from '../services/vault-api.service';
import { VaultCryptoService } from '../services/vault-crypto.service';
import { AuthService } from '../../auth/auth.service';

export const vaultReadyGuard: CanActivateFn = async () => {
  const vaultApi = inject(VaultApiService);
  const crypto = inject(VaultCryptoService);
  const router = inject(Router);

  try {
    const { isSetup } = await firstValueFrom(vaultApi.getVaultStatus());

    if (!isSetup) {
      router.navigate(['/vault/setup']);
      return false;
    }

    if (!crypto.isUnlocked) {
      router.navigate(['/vault/unlock']);
      return false;
    }

    return true;
  } catch {
    router.navigate(['/login']);
    return false;
  }
};

export const vaultSetupGuard: CanActivateFn = async () => {
  const vaultApi = inject(VaultApiService);
  const crypto = inject(VaultCryptoService);
  const auth = inject(AuthService);
  const router = inject(Router);

  try {
    const { isSetup } = await firstValueFrom(vaultApi.getVaultStatus());
    const userId = auth.userId();
    const hasLocalToken = userId ? await crypto.hasLocalVerification(userId) : false;

    if (isSetup && hasLocalToken && crypto.isUnlocked) {
      router.navigate(['/vault']);
      return false;
    }

    if (isSetup && hasLocalToken && !crypto.isUnlocked) {
      router.navigate(['/vault/unlock']);
      return false;
    }

    // isSetup && !hasLocalToken → allow setup (re-initialization on this device)
    // !isSetup → allow setup (first-time setup)
    return true;
  } catch {
    router.navigate(['/login']);
    return false;
  }
};

export const vaultUnlockGuard: CanActivateFn = async () => {
  const vaultApi = inject(VaultApiService);
  const crypto = inject(VaultCryptoService);
  const auth = inject(AuthService);
  const router = inject(Router);

  try {
    const { isSetup } = await firstValueFrom(vaultApi.getVaultStatus());
    const userId = auth.userId();
    const hasLocalToken = userId ? await crypto.hasLocalVerification(userId) : false;

    if (!isSetup) {
      router.navigate(['/vault/setup']);
      return false;
    }

    if (isSetup && !hasLocalToken) {
      router.navigate(['/vault/setup']); // Must re-initialize on this device
      return false;
    }

    if (crypto.isUnlocked) {
      router.navigate(['/vault']);
      return false;
    }

    return true;
  } catch {
    router.navigate(['/login']);
    return false;
  }
};
