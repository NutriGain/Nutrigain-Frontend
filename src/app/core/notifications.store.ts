import { computed, Injectable, signal } from '@angular/core';
import { ApiService } from './api.service';
import { AppNotification } from './models';

/** Single source of truth for the notification inbox so the bell updates after any action. */
@Injectable({ providedIn: 'root' })
export class NotificationsStore {
  readonly items = signal<AppNotification[]>([]);
  readonly unseen = computed(() => this.items().filter(n => !n.seen).length);

  constructor(private api: ApiService) {}

  refresh(): void {
    this.api.getNotifications().subscribe({
      next: items => this.items.set(items),
      error: () => { /* the bell simply keeps its last state */ }
    });
  }

  markAllSeen(): void {
    this.api.markAllNotificationsSeen().subscribe(() =>
      this.items.update(list => list.map(n => ({ ...n, seen: true }))));
  }

  clear(): void {
    this.items.set([]);
  }
}
