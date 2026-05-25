import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { VaultState } from '../../services/vault.state';
import { AnimatedBackground } from '../../../shared/components/animated-background/animated-background';

@Component({
  selector: 'app-vault-setup',
  standalone: true,
  imports: [FormsModule, AnimatedBackground],
  templateUrl: './vault-setup.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VaultSetup {
  private vaultState = inject(VaultState);
  private router = inject(Router);

  masterPassword = signal('');
  confirmPassword = signal('');
  error = signal<string | null>(null);
  loading = signal(false);

  async setup(): Promise<void> {
    if (this.masterPassword().length < 8) {
      this.error.set('Master password must be at least 8 characters');
      return;
    }
    if (this.masterPassword() !== this.confirmPassword()) {
      this.error.set('Passwords do not match');
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    try {
      await this.vaultState.setupVault(this.masterPassword());
      await this.vaultState.unlockVault(this.masterPassword());
      this.router.navigate(['/vault']);
    } catch (err) {
      this.error.set(err instanceof Error ? err.message : 'Setup failed');
    } finally {
      this.loading.set(false);
    }
  }
}
