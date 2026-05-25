import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { VaultState } from '../../services/vault.state';
import { AnimatedBackground } from '../../../shared/components/animated-background/animated-background';

@Component({
  selector: 'app-vault-unlock',
  standalone: true,
  imports: [FormsModule, AnimatedBackground],
  templateUrl: './vault-unlock.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VaultUnlock {
  private vaultState = inject(VaultState);
  private router = inject(Router);

  masterPassword = signal('');
  error = signal<string | null>(null);
  loading = signal(false);

  async unlock(): Promise<void> {
    if (!this.masterPassword()) return;

    this.loading.set(true);
    this.error.set(null);

    try {
      const success = await this.vaultState.unlockVault(this.masterPassword());
      if (success) {
        this.router.navigate(['/vault']);
      } else {
        this.error.set('Invalid master password');
      }
    } catch {
      this.error.set('Failed to unlock vault');
    } finally {
      this.loading.set(false);
    }
  }
}
