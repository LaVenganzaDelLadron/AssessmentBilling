import { Injectable, signal } from '@angular/core';

export type AlertType = 'success' | 'warning' | 'error' | 'info';

export interface AlertToast {
  id: number;
  message: string;
  title?: string;
  type: AlertType;
  duration: number;
}

@Injectable({
  providedIn: 'root'
})
export class AlertService {
  private nextId = 1;
  private readonly _toasts = signal<AlertToast[]>([]);

  readonly toasts = this._toasts.asReadonly();

  show(payload: Omit<AlertToast, 'id'>) {
    const toast: AlertToast = {
      id: this.nextId++,
      ...payload
    };

    this._toasts.update((current) => [...current, toast]);

    if (toast.duration > 0) {
      window.setTimeout(() => this.dismiss(toast.id), toast.duration);
    }
  }

  success(message: string, title = 'Success', duration = 3500) {
    this.show({ message, title, type: 'success', duration });
  }

  warning(message: string, title = 'Warning', duration = 4000) {
    this.show({ message, title, type: 'warning', duration });
  }

  error(message: string, title = 'Error', duration = 5000) {
    this.show({ message, title, type: 'error', duration });
  }

  info(message: string, title = 'Info', duration = 3500) {
    this.show({ message, title, type: 'info', duration });
  }

  dismiss(id: number) {
    this._toasts.update((current) => current.filter((toast) => toast.id !== id));
  }
}
