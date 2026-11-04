import { Injectable, signal } from '@angular/core';

export interface Toast {
  id: number;
  type: 'success' | 'error' | 'info';
  message: string;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  private nextId = 1;
  readonly items = signal<Toast[]>([]);

  show(type: Toast['type'], message: string, durationMs = 3500): void {
    const id = this.nextId++;
    this.items.update(list => [...list.slice(-3), { id, type, message }]);
    setTimeout(() => this.dismiss(id), durationMs);
  }

  success(message: string): void {
    this.show('success', message);
  }

  error(message: string): void {
    this.show('error', message, 5000);
  }

  info(message: string): void {
    this.show('info', message);
  }

  dismiss(id: number): void {
    this.items.update(list => list.filter(t => t.id !== id));
  }
}
