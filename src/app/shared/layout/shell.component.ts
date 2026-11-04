import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { Subscription, filter } from 'rxjs';
import { AuthService } from '../../core/auth.service';
import { NotificationsStore } from '../../core/notifications.store';
import { ToastService } from '../../core/toast.service';
import { initials, timeAgo } from '../../core/format';
import { AppNotification } from '../../core/models';

interface NavItem {
  path: string;
  label: string;
  icon: string;
}

const NOTIFICATION_ICONS: Record<AppNotification['type'], string> = {
  WELCOME: 'waving_hand',
  BADGE_AWARDED: 'military_tech',
  CHALLENGE_COMPLETED: 'task_alt',
  LEVEL_UP: 'trending_up'
};

/** Authenticated layout: sidebar on desktop, top bar + bottom tabs on mobile, notifications and toasts. */
@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="shell">
      <aside class="sidebar" aria-label="Navegación principal">
        <a class="brand" routerLink="/dashboard"><span class="logo">N</span>NutriGain</a>
        <nav>
          <a *ngFor="let n of nav" class="nav-item" [routerLink]="n.path" routerLinkActive="active">
            <span class="material-icons">{{ n.icon }}</span>{{ n.label }}
          </a>
        </nav>
        <a class="user-card" routerLink="/perfil" routerLinkActive="active">
          <span class="initial">{{ initial }}</span>
          <span class="who"><strong>{{ name }}</strong><small>Ver perfil</small></span>
        </a>
      </aside>

      <div class="main">
        <header class="topbar">
          <a class="brand brand-mobile" routerLink="/dashboard"><span class="logo">N</span>NutriGain</a>
          <span class="spacer"></span>

          <div class="menu-wrap">
            <button class="icon-btn" type="button" aria-label="Notificaciones" (click)="toggle('bell', $event)">
              <span class="material-icons">notifications</span>
              <span class="badge" *ngIf="store.unseen() > 0">{{ store.unseen() > 9 ? '9+' : store.unseen() }}</span>
            </button>
            <div class="panel notif" *ngIf="open === 'bell'" (click)="$event.stopPropagation()">
              <div class="panel-head">
                <strong>Notificaciones</strong>
                <button class="link" type="button" *ngIf="store.unseen() > 0" (click)="store.markAllSeen()">Marcar como leídas</button>
              </div>
              <div class="empty-mini" *ngIf="store.items().length === 0">No tienes notificaciones todavía</div>
              <ul>
                <li *ngFor="let n of store.items() | slice: 0 : 6" [class.unseen]="!n.seen">
                  <span class="material-icons ico">{{ icon(n) }}</span>
                  <div>
                    <strong>{{ n.title }}</strong>
                    <p>{{ n.message }}</p>
                    <small>{{ ago(n.createdAt) }}</small>
                  </div>
                </li>
              </ul>
            </div>
          </div>

          <div class="menu-wrap">
            <button class="icon-btn initial-btn" type="button" aria-label="Cuenta" (click)="toggle('user', $event)">{{ initial }}</button>
            <div class="panel account" *ngIf="open === 'user'" (click)="$event.stopPropagation()">
              <div class="account-head"><strong>{{ name }}</strong><small>{{ email }}</small></div>
              <a routerLink="/perfil" (click)="open = null"><span class="material-icons">person</span>Perfil</a>
              <a routerLink="/logros" (click)="open = null"><span class="material-icons">military_tech</span>Logros</a>
              <a routerLink="/progreso" (click)="open = null"><span class="material-icons">show_chart</span>Progreso</a>
              <button type="button" class="danger" (click)="logout()"><span class="material-icons">logout</span>Cerrar sesión</button>
            </div>
          </div>
        </header>

        <main><router-outlet></router-outlet></main>
      </div>

      <nav class="tabbar" aria-label="Navegación móvil">
        <a *ngFor="let n of tabs" [routerLink]="n.path" routerLinkActive="active">
          <span class="material-icons">{{ n.icon }}</span><span>{{ n.label }}</span>
        </a>
      </nav>

      <div class="toasts" aria-live="polite">
        <div *ngFor="let t of toast.items()" class="toast" [ngClass]="t.type" (click)="toast.dismiss(t.id)">
          <span class="material-icons">{{ t.type === 'success' ? 'check_circle' : t.type === 'error' ? 'error' : 'info' }}</span>
          {{ t.message }}
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }
    .sidebar {
      position: fixed; inset: 0 auto 0 0; width: var(--sidebar-w); background: var(--surface); border-right: 1px solid var(--line);
      display: flex; flex-direction: column; padding: 20px 14px; gap: 18px; z-index: 30;
    }
    .sidebar .brand { padding: 4px 10px 8px; }
    .sidebar nav { display: flex; flex-direction: column; gap: 4px; flex: 1; }
    .nav-item { display: flex; align-items: center; gap: 12px; padding: 11px 14px; border-radius: 12px; color: var(--muted); font-weight: 600; font-size: 14.5px; transition: background .15s, color .15s; }
    .nav-item:hover { background: var(--surface-2); color: var(--text); }
    .nav-item.active { background: var(--brand-50); color: var(--brand-700); }
    .nav-item.active .material-icons { color: var(--brand-600); }
    .user-card { display: flex; align-items: center; gap: 12px; padding: 10px; border-radius: 14px; border: 1px solid var(--line); }
    .user-card:hover, .user-card.active { background: var(--surface-2); }
    .initial, .initial-btn { background: linear-gradient(135deg, #34d399, #059669); color: #fff; font-weight: 700; }
    .initial { width: 38px; height: 38px; border-radius: 12px; display: inline-flex; align-items: center; justify-content: center; }
    .who { display: flex; flex-direction: column; min-width: 0; }
    .who strong { font-size: 14px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .who small { color: var(--muted); font-size: 12px; }

    .main { margin-left: var(--sidebar-w); min-height: 100vh; }
    .topbar {
      position: sticky; top: 0; z-index: 20; height: var(--topbar-h); display: flex; align-items: center; gap: 10px; padding: 0 24px;
      background: rgba(244, 246, 248, .85); backdrop-filter: blur(10px); border-bottom: 1px solid var(--line);
    }
    .brand-mobile { display: none; }
    .spacer { flex: 1; }
    .menu-wrap { position: relative; }
    .badge { position: absolute; top: -5px; right: -5px; min-width: 18px; height: 18px; padding: 0 5px; border-radius: 999px; background: var(--danger); color: #fff; font-size: 11px; font-weight: 700; display: inline-flex; align-items: center; justify-content: center; border: 2px solid var(--bg); }
    .panel { position: absolute; right: 0; top: 48px; width: 340px; max-width: calc(100vw - 24px); background: var(--surface); border: 1px solid var(--line); border-radius: 16px; box-shadow: var(--shadow-lg); overflow: hidden; z-index: 40; animation: fade-in .15s ease; }
    .panel-head { display: flex; justify-content: space-between; align-items: center; padding: 14px 16px; border-bottom: 1px solid var(--line); }
    .link { border: 0; background: transparent; color: var(--brand-700); font-weight: 600; font-size: 13px; }
    .notif ul { list-style: none; margin: 0; padding: 0; max-height: 380px; overflow-y: auto; }
    .notif li { display: flex; gap: 12px; padding: 12px 16px; border-bottom: 1px solid #f1f4f8; }
    .notif li.unseen { background: var(--brand-50); }
    .notif li p { font-size: 13px; color: var(--muted); }
    .notif li small { font-size: 11.5px; color: #94a3b8; }
    .ico { color: var(--brand-600); background: #fff; border: 1px solid var(--brand-100); border-radius: 10px; width: 36px; height: 36px; display: inline-flex; align-items: center; justify-content: center; flex: none; }
    .empty-mini { padding: 28px 16px; text-align: center; color: var(--muted); font-size: 14px; }
    .account { width: 230px; padding: 6px; }
    .account-head { display: flex; flex-direction: column; padding: 10px 12px; border-bottom: 1px solid var(--line); margin-bottom: 4px; }
    .account-head small { color: var(--muted); font-size: 12px; overflow: hidden; text-overflow: ellipsis; }
    .account a, .account button { display: flex; align-items: center; gap: 10px; width: 100%; padding: 10px 12px; border: 0; background: transparent; border-radius: 10px; font-weight: 500; font-size: 14px; text-align: left; }
    .account a:hover, .account button:hover { background: var(--surface-2); }
    .account .danger { color: var(--danger); }

    .tabbar { display: none; }
    .toasts { position: fixed; right: 20px; bottom: 20px; display: flex; flex-direction: column; gap: 10px; z-index: 100; }
    .toast { display: flex; align-items: center; gap: 10px; padding: 12px 16px; border-radius: 14px; background: #0f172a; color: #fff; font-size: 14px; font-weight: 500; box-shadow: var(--shadow-lg); cursor: pointer; animation: fade-in .25s ease; max-width: 360px; }
    .toast.success .material-icons { color: #34d399; }
    .toast.error { background: #7f1d1d; }
    .toast.error .material-icons { color: #fca5a5; }
    .toast.info .material-icons { color: #93c5fd; }

    @media (max-width: 900px) {
      .sidebar { display: none; }
      .main { margin-left: 0; }
      .topbar { padding: 0 16px; }
      .brand-mobile { display: inline-flex; font-size: 18px; }
      .tabbar {
        position: fixed; left: 0; right: 0; bottom: 0; z-index: 30; display: flex; justify-content: space-around;
        background: rgba(255, 255, 255, .96); backdrop-filter: blur(10px); border-top: 1px solid var(--line);
        padding: 6px 4px calc(6px + env(safe-area-inset-bottom));
      }
      .tabbar a { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 2px; padding: 6px 0; color: var(--muted); font-size: 11px; font-weight: 600; border-radius: 12px; }
      .tabbar a.active { color: var(--brand-700); }
      .tabbar a.active .material-icons { background: var(--brand-50); }
      .tabbar .material-icons { padding: 4px 16px; border-radius: 999px; font-size: 22px; }
      .toasts { left: 16px; right: 16px; bottom: 84px; }
      .toast { max-width: none; }
    }
  `]
})
export class ShellComponent implements OnInit, OnDestroy {
  readonly nav: NavItem[] = [
    { path: '/dashboard', label: 'Inicio', icon: 'dashboard' },
    { path: '/rutinas', label: 'Rutinas', icon: 'fitness_center' },
    { path: '/nutricion', label: 'Nutrición', icon: 'restaurant' },
    { path: '/retos', label: 'Retos', icon: 'bolt' },
    { path: '/progreso', label: 'Progreso', icon: 'show_chart' },
    { path: '/ranking', label: 'Ranking', icon: 'leaderboard' },
    { path: '/logros', label: 'Logros', icon: 'military_tech' }
  ];
  readonly tabs: NavItem[] = [
    { path: '/dashboard', label: 'Inicio', icon: 'dashboard' },
    { path: '/rutinas', label: 'Rutinas', icon: 'fitness_center' },
    { path: '/nutricion', label: 'Nutrición', icon: 'restaurant' },
    { path: '/retos', label: 'Retos', icon: 'bolt' },
    { path: '/ranking', label: 'Ranking', icon: 'leaderboard' }
  ];

  open: 'bell' | 'user' | null = null;
  readonly ago = timeAgo;
  private sub?: Subscription;
  private timer?: ReturnType<typeof setInterval>;

  constructor(
    private auth: AuthService,
    private router: Router,
    readonly store: NotificationsStore,
    readonly toast: ToastService
  ) {}

  get name(): string {
    return this.auth.user()?.name ?? '';
  }

  get email(): string {
    return this.auth.user()?.email ?? '';
  }

  get initial(): string {
    return initials(this.name) || 'N';
  }

  ngOnInit(): void {
    this.store.refresh();
    this.sub = this.router.events.pipe(filter(e => e instanceof NavigationEnd)).subscribe(() => {
      this.open = null;
      this.store.refresh();
    });
    this.timer = setInterval(() => this.store.refresh(), 60000);
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
    clearInterval(this.timer);
  }

  icon(n: AppNotification): string {
    return NOTIFICATION_ICONS[n.type] ?? 'notifications';
  }

  toggle(menu: 'bell' | 'user', event: Event): void {
    event.stopPropagation();
    this.open = this.open === menu ? null : menu;
  }

  @HostListener('document:click')
  closeMenus(): void {
    this.open = null;
  }

  @HostListener('document:keydown.escape')
  closeOnEscape(): void {
    this.open = null;
  }

  logout(): void {
    this.open = null;
    this.store.clear();
    this.auth.logout();
  }
}
