import { Injectable, signal } from '@angular/core';

export interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  private counter = 0;
  toasts = signal<Toast[]>([]);

  success(message: string, duration = 3000): void {
    this.add({ message, type: 'success' }, duration);
  }

  error(message: string, duration = 5000): void {
    this.add({ message, type: 'error' }, duration);
  }

  info(message: string, duration = 3000): void {
    this.add({ message, type: 'info' }, duration);
  }

  dismiss(id: number): void {
    this.toasts.update((t) => t.filter((toast) => toast.id !== id));
  }

  private add(toast: Omit<Toast, 'id'>, duration: number): void {
    const id = ++this.counter;
    this.toasts.update((t) => [...t, { ...toast, id }]);
    setTimeout(() => this.dismiss(id), duration);
  }
}
