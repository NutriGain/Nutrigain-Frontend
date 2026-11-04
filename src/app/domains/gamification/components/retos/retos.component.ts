import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../../../core/api.service';
import { NotificationsStore } from '../../../../core/notifications.store';
import { ToastService } from '../../../../core/toast.service';
import { ChallengeAssignment, ChallengeCategory, Difficulty } from '../../../../core/models';
import { CATEGORIES, categoryEs, difficultyEs, todayIso } from '../../../../core/i18n';
import { RingComponent } from '../../../../shared/charts/ring.component';

const DIFFICULTY_PILL: Record<Difficulty, string> = {
  EASY: 'pill-green',
  MEDIUM: 'pill-blue',
  HARD: 'pill-orange',
  EXTREME: 'pill-red'
};

@Component({
  selector: 'app-retos',
  standalone: true,
  imports: [CommonModule, RingComponent],
  template: `
    <div class="page">
      <div class="page-head">
        <div>
          <h1 class="page-title">Retos</h1>
          <p class="page-sub">Supera desafíos aleatorios y el reto extremo del día para ganar XP</p>
        </div>
        <div class="today card">
          <app-ring [value]="progress" [size]="60" [stroke]="8" color="#f97316"><strong>{{ completedToday }}</strong></app-ring>
          <div><strong>{{ completedToday }} de {{ totalToday }}</strong><small>retos de hoy</small></div>
        </div>
      </div>

      <div class="chips filters">
        <button type="button" class="chip" *ngFor="let c of categories" [class.active]="category === c.code" (click)="selectCategory(c.code)">{{ c.label }}</button>
      </div>

      <div class="grid split layout">
        <section>
          <div class="skeleton" style="height: 300px" *ngIf="loading"></div>

          <article class="challenge card fade-in" *ngIf="current as c" [class.extreme]="c.kind === 'DAILY_EXTREME'" [class.done]="c.status === 'COMPLETED'">
            <div class="top">
              <div class="tags">
                <span class="pill" [ngClass]="pill(c)">{{ difficulty(c) }}</span>
                <span class="pill pill-gray">{{ category_(c) }}</span>
                <span class="pill pill-red" *ngIf="c.kind === 'DAILY_EXTREME'"><span class="material-icons">local_fire_department</span>Extremo del día</span>
              </div>
              <span class="xp">+{{ c.xpReward }} XP</span>
            </div>
            <h2>{{ c.challenge.title }}</h2>
            <p>{{ c.challenge.description }}</p>
            <div class="actions">
              <button type="button" class="btn btn-primary" [disabled]="c.status === 'COMPLETED' || busy" (click)="complete()">
                <span class="material-icons">{{ c.status === 'COMPLETED' ? 'check_circle' : 'task_alt' }}</span>
                {{ c.status === 'COMPLETED' ? 'Completado' : 'Completar reto' }}
              </button>
              <button type="button" class="btn btn-ghost" [disabled]="busy" (click)="draw()"><span class="material-icons">casino</span>Otro reto</button>
              <button type="button" class="btn btn-accent" [disabled]="busy" (click)="loadExtreme()"><span class="material-icons">local_fire_department</span>Reto extremo</button>
            </div>
          </article>

          <div class="empty card" *ngIf="!loading && !current"><span class="material-icons">flag</span><p>{{ error || 'No hay retos disponibles.' }}</p></div>
        </section>

        <aside class="card card-pad history">
          <div class="card-head"><h3 class="card-title"><span class="material-icons">history</span>Tus retos recientes</h3></div>
          <ul *ngIf="recent.length; else none">
            <li *ngFor="let a of recent" [class.completed]="a.status === 'COMPLETED'">
              <span class="material-icons status">{{ a.status === 'COMPLETED' ? 'check_circle' : 'radio_button_unchecked' }}</span>
              <div>
                <strong>{{ a.challenge.title }}</strong>
                <small>{{ difficulty(a) }} · +{{ a.xpReward }} XP</small>
              </div>
            </li>
          </ul>
          <ng-template #none><p class="muted">Todavía no tienes retos. ¡Saca tu primero!</p></ng-template>
        </aside>
      </div>
    </div>
  `,
  styles: [`
    .today { display: flex; align-items: center; gap: 12px; padding: 10px 18px 10px 10px; }
    .today div:last-child { display: flex; flex-direction: column; }
    .today small { color: var(--muted); font-size: 12.5px; }
    .filters { margin-bottom: 16px; }
    .challenge { padding: 28px; display: flex; flex-direction: column; gap: 14px; }
    .challenge.extreme { border-color: #fdba74; background: linear-gradient(135deg, #fff 0%, var(--accent-50) 100%); }
    .challenge.done { opacity: .88; }
    .top { display: flex; justify-content: space-between; align-items: flex-start; gap: 12px; }
    .tags { display: flex; gap: 6px; flex-wrap: wrap; }
    .tags .material-icons { font-size: 14px; }
    .xp { font-size: 24px; font-weight: 800; color: var(--brand-700); white-space: nowrap; }
    .extreme .xp { color: var(--accent-600); }
    h2 { font-size: 26px; font-weight: 800; }
    .challenge p { color: #334155; font-size: 16px; }
    .actions { display: flex; gap: 10px; flex-wrap: wrap; margin-top: 8px; }
    .history ul { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 4px; }
    .history li { display: flex; gap: 10px; align-items: center; padding: 10px 4px; border-bottom: 1px solid #f1f4f8; }
    .history li div { display: flex; flex-direction: column; min-width: 0; }
    .history li strong { font-size: 14px; }
    .history li small { color: var(--muted); font-size: 12px; }
    .status { color: #cbd5e1; }
    .completed .status { color: var(--brand); }
    .completed strong { text-decoration: line-through; color: var(--muted); }
  `]
})
export class RetosComponent implements OnInit {
  readonly categories = CATEGORIES;
  category: ChallengeCategory | null = null;
  current: ChallengeAssignment | null = null;
  history: ChallengeAssignment[] = [];
  loading = true;
  busy = false;
  error = '';

  readonly difficulty = (a: ChallengeAssignment) => difficultyEs(a.challenge.difficulty);
  readonly category_ = (a: ChallengeAssignment) => categoryEs(a.challenge.category);
  readonly pill = (a: ChallengeAssignment) => DIFFICULTY_PILL[a.challenge.difficulty];

  constructor(private api: ApiService, private store: NotificationsStore, private toast: ToastService) {}

  ngOnInit(): void {
    this.api.getMyChallenges().subscribe({
      next: list => {
        this.history = list;
        this.current = list.find(a => a.status === 'PENDING') ?? null;
        this.loading = false;
        if (!this.current) {
          this.draw();
        }
      },
      error: () => (this.loading = false)
    });
  }

  private todays(): ChallengeAssignment[] {
    const today = todayIso();
    return this.history.filter(h => h.assignedOn === today);
  }

  get completedToday(): number {
    return this.todays().filter(h => h.status === 'COMPLETED').length;
  }

  get totalToday(): number {
    return this.todays().length;
  }

  get progress(): number {
    return this.totalToday === 0 ? 0 : (this.completedToday / this.totalToday) * 100;
  }

  get recent(): ChallengeAssignment[] {
    return this.history.slice(0, 8);
  }

  selectCategory(code: ChallengeCategory | null): void {
    this.category = code;
    this.draw();
  }

  draw(): void {
    this.busy = true;
    this.error = '';
    this.api.drawChallenge(this.category).subscribe({
      next: a => {
        this.current = a;
        this.history = [a, ...this.history];
        this.busy = false;
      },
      error: () => {
        this.busy = false;
        this.error = 'No hay retos disponibles para esa categoría.';
      }
    });
  }

  loadExtreme(): void {
    this.busy = true;
    this.api.requestDailyExtreme().subscribe({
      next: a => {
        this.current = a;
        if (!this.history.some(h => h.id === a.id)) {
          this.history = [a, ...this.history];
        }
        this.busy = false;
      },
      error: () => (this.busy = false)
    });
  }

  complete(): void {
    if (!this.current || this.current.status === 'COMPLETED') {
      return;
    }
    this.busy = true;
    this.api.completeChallenge(this.current.id).subscribe({
      next: done => {
        this.current = done;
        this.history = this.history.map(h => (h.id === done.id ? done : h));
        this.busy = false;
        this.toast.success(`¡Reto completado! +${done.xpReward} XP`);
        this.store.refresh();
      },
      error: () => {
        this.busy = false;
        this.toast.error('No se pudo completar el reto.');
      }
    });
  }
}
