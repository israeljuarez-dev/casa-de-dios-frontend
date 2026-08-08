import { Service, signal } from '@angular/core';

export type ToastType = 'success' | 'error' | 'info';

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

const TOAST_DURATION_MS = 3500;

@Service()
export class ToastService {

  private toastsSignal = signal<Toast[]>([]);
  
  toasts = this.toastsSignal.asReadonly();

  show(message: string, type: ToastType = 'success'): void {
    const toast: Toast = { id: crypto.randomUUID(), message, type };
    this.toastsSignal.update((current) => [...current, toast]);
    setTimeout(() => this.dismiss(toast.id), TOAST_DURATION_MS);
  }

  dismiss(id: string): void {
    this.toastsSignal.update((current) => current.filter((t) => t.id !== id));
  }
}