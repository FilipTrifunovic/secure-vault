import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PasswordGeneratorService, PasswordOptions } from '../../../../services/password-generator.service';

@Component({
  selector: 'app-password-generator',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './password-generator.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PasswordGeneratorWidget {
  private pwGen = inject(PasswordGeneratorService);

  password = signal('');
  copied = signal(false);
  options = signal<PasswordOptions>(this.pwGen.getDefaultOptions());
  strength = signal(0);

  generate(): void {
    const pw = this.pwGen.generate(this.options());
    this.password.set(pw);
    this.strength.set(this.pwGen.calculateStrength(pw));
    this.copied.set(false);
  }

  async copy(): Promise<void> {
    if (!this.password()) return;
    await navigator.clipboard.writeText(this.password());
    this.copied.set(true);
    setTimeout(() => this.copied.set(false), 2000);
  }

  updateOption(key: keyof PasswordOptions, value: boolean | number): void {
    this.options.update((o) => ({ ...o, [key]: value }));
  }

  getStrengthLabel(): string {
    const s = this.strength();
    if (s <= 1) return 'Weak';
    if (s <= 2) return 'Fair';
    if (s <= 3) return 'Good';
    if (s <= 4) return 'Strong';
    return 'Very Strong';
  }

  getStrengthColor(): string {
    const s = this.strength();
    if (s <= 1) return 'bg-red-500';
    if (s <= 2) return 'bg-orange-500';
    if (s <= 3) return 'bg-yellow-500';
    if (s <= 4) return 'bg-green-500';
    return 'bg-emerald-400';
  }

  getStrengthTextColor(): string {
    const s = this.strength();
    if (s <= 1) return 'text-red-400';
    if (s <= 2) return 'text-orange-400';
    if (s <= 3) return 'text-yellow-400';
    if (s <= 4) return 'text-green-400';
    return 'text-emerald-400';
  }

  getStrengthWidthClass(): string {
    const map = ['w-0', 'w-1/5', 'w-2/5', 'w-3/5', 'w-4/5', 'w-full'];
    return map[Math.min(this.strength(), 5)];
  }
}
