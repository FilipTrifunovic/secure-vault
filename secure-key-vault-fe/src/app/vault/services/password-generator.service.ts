import { Injectable } from '@angular/core';

export interface PasswordOptions {
  length: number;
  uppercase: boolean;
  lowercase: boolean;
  numbers: boolean;
  symbols: boolean;
}

@Injectable({ providedIn: 'root' })
export class PasswordGeneratorService {
  private readonly UPPERCASE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  private readonly LOWERCASE = 'abcdefghijklmnopqrstuvwxyz';
  private readonly NUMBERS = '0123456789';
  private readonly SYMBOLS = '!@#$%^&*()_+-=[]{}|;:,.<>?';

  generate(options: PasswordOptions): string {
    let charset = '';
    if (options.uppercase) charset += this.UPPERCASE;
    if (options.lowercase) charset += this.LOWERCASE;
    if (options.numbers) charset += this.NUMBERS;
    if (options.symbols) charset += this.SYMBOLS;

    if (!charset) charset = this.LOWERCASE + this.NUMBERS;

    const array = new Uint32Array(options.length);
    crypto.getRandomValues(array);

    return Array.from(array, (n) => charset[n % charset.length]).join('');
  }

  getDefaultOptions(): PasswordOptions {
    return {
      length: 20,
      uppercase: true,
      lowercase: true,
      numbers: true,
      symbols: true,
    };
  }

  calculateStrength(password: string): number {
    let score = 0;
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (password.length >= 16) score++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[^a-zA-Z0-9]/.test(password)) score++;
    return Math.min(score, 5);
  }
}
