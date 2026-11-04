import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../core/api.service';
import { Badge } from '../../core/models';
import { parseIsoDate } from '../../core/format';
import { RingComponent } from '../../shared/charts/ring.component';

const ICONS: Record<string, string> = {
  FIRST_WORKOUT: 'fitness_center',
  TEN_WORKOUTS: 'repeat',
  FIRST_CHALLENGE: 'flag',
  EXTREME_CHAMPION: 'local_fire_department',
  WEEK_STREAK: 'event_available',
  MONTH_STREAK: 'workspace_premium',
  LEVEL_5: 'stars'
};

@Component({
  selector: 'app-achievements',
  standalone: true,
  imports: [CommonModule, RingComponent],
  template: `
    <div class="page">
      <div class="page-head">
        <div>
          <h1 class="page-title">Logros</h1>
          <p class="page-sub">Desbloquea insignias entrenando, completando retos y manteniendo tu racha</p>
        </div>
        <div class="summary card" *ngIf="badges.length">
          <app-ring [value]="percent" [size]="64" [stroke]="8" color="#8b5cf6"><strong>{{ unlocked }}</strong></app-ring>
          <div><strong>{{ unlocked }} de {{ badges.length }}</strong><small>insignias desbloqueadas</small></div>
        </div>
      </div>

      <div class="grid cols-3" *ngIf="loading">
        <div class="skeleton" style="height: 190px" *ngFor="let s of [1, 2, 3]"></div>
      </div>

      <div class="grid cols-3">
        <article class="badge card fade-in" *ngFor="let b of badges" [class.locked]="!b.unlocked">
          <div class="icon"><span class="material-icons">{{ b.unlocked ? icon(b.code) : 'lock' }}</span></div>
          <h3>{{ b.title }}</h3>
          <p>{{ b.description }}</p>
          <span class="pill pill-green" *ngIf="b.unlocked"><span class="material-icons">check</span>{{ date(b.awardedOn) }}</span>
          <span class="pill pill-gray" *ngIf="!b.unlocked">Bloqueada</span>
        </article>
      </div>
    </div>
  `,
  styles: [`
    .summary { display: flex; align-items: center; gap: 12px; padding: 10px 18px 10px 10px; }
    .summary div:last-child { display: flex; flex-direction: column; }
    .summary small { color: var(--muted); font-size: 12.5px; }
    .badge { padding: 24px 20px; display: flex; flex-direction: column; align-items: center; text-align: center; gap: 8px; transition: transform .2s, box-shadow .2s; }
    .badge:not(.locked):hover { transform: translateY(-3px); box-shadow: var(--shadow-lg); }
    .icon { width: 64px; height: 64px; border-radius: 20px; display: flex; align-items: center; justify-content: center; background: linear-gradient(135deg, #34d399, #059669); color: #fff; box-shadow: 0 10px 22px rgba(16, 185, 129, .32); margin-bottom: 6px; }
    .icon .material-icons { font-size: 30px; }
    h3 { font-size: 17px; font-weight: 800; }
    p { color: var(--muted); font-size: 14px; flex: 1; }
    .locked .icon { background: #e5e9ef; color: #94a3b8; box-shadow: none; }
    .locked h3 { color: var(--muted); }
    .pill .material-icons { font-size: 14px; }
  `]
})
export class AchievementsComponent implements OnInit {
  badges: Badge[] = [];
  loading = true;

  constructor(private api: ApiService) {}

  get unlocked(): number {
    return this.badges.filter(b => b.unlocked).length;
  }

  get percent(): number {
    return this.badges.length ? (this.unlocked / this.badges.length) * 100 : 0;
  }

  ngOnInit(): void {
    this.api.getBadges().subscribe({
      next: badges => {
        this.badges = badges;
        this.loading = false;
      },
      error: () => (this.loading = false)
    });
  }

  icon(code: string): string {
    return ICONS[code] ?? 'military_tech';
  }

  date(iso: string | null): string {
    return iso ? parseIsoDate(iso).toLocaleDateString('es', { day: 'numeric', month: 'short', year: 'numeric' }) : '';
  }
}
