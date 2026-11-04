import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Observable, catchError, forkJoin, of } from 'rxjs';
import { ApiService } from '../../../../core/api.service';
import { AuthService } from '../../../../core/auth.service';
import { NotificationsStore } from '../../../../core/notifications.store';
import { ToastService } from '../../../../core/toast.service';
import { Avatar, BodyWeight, ChallengeAssignment, RoutineDay, Streak, WeeklyProgress } from '../../../../core/models';
import { greeting, shortDate, todayDayOfWeek } from '../../../../core/format';
import { categoryEs, dayEs, moodEs } from '../../../../core/i18n';
import { BarChartComponent } from '../../../../shared/charts/bar-chart.component';
import { ChartPoint, LineChartComponent } from '../../../../shared/charts/line-chart.component';
import { RingComponent } from '../../../../shared/charts/ring.component';
import { CharacterAvatarComponent } from '../../../../shared/ui/character-avatar.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, LineChartComponent, BarChartComponent, RingComponent, CharacterAvatarComponent],
  template: `
    <div class="page">
      <!-- Header -->
      <section class="hero card fade-in">
        <div class="hero-text">
          <p class="eyebrow">{{ greeting }}</p>
          <h1>{{ firstName }} 👋</h1>
          <p class="sub" *ngIf="!loading">{{ subtitle }}</p>
          <blockquote *ngIf="quote">“{{ quote }}”</blockquote>
          <div class="hero-actions">
            <a class="btn btn-primary" routerLink="/rutinas"><span class="material-icons">fitness_center</span>Ir a mis rutinas</a>
            <a class="btn btn-ghost" routerLink="/nutricion"><span class="material-icons">restaurant</span>Mi plan</a>
          </div>
        </div>
        <a class="hero-avatar" routerLink="/perfil" *ngIf="avatar" aria-label="Ver mi perfil">
          <app-character-avatar [name]="avatar.characterName" [level]="avatar.level" [percent]="xpPercent" [size]="132"></app-character-avatar>
          <strong>{{ avatar.characterName }}</strong>
          <small>{{ avatar.experienceToNextLevel }} XP para el nivel {{ avatar.level + 1 }}</small>
        </a>
      </section>

      <!-- Skeleton -->
      <div class="grid cols-4 section" *ngIf="loading">
        <div class="skeleton" style="height: 128px" *ngFor="let s of [1, 2, 3, 4]"></div>
      </div>

      <ng-container *ngIf="!loading">
        <!-- Stats -->
        <div class="grid cols-4 section">
          <div class="card stat fade-in">
            <div class="stat-top"><span class="stat-icon" style="background: var(--accent-50); color: var(--accent)"><span class="material-icons">local_fire_department</span></span>Racha actual</div>
            <div class="stat-value">{{ streak?.currentDays ?? 0 }}<small>{{ (streak?.currentDays ?? 0) === 1 ? 'día' : 'días' }}</small></div>
            <div class="stat-note">Mejor racha: {{ streak?.longestDays ?? 0 }} {{ (streak?.longestDays ?? 0) === 1 ? 'día' : 'días' }}</div>
          </div>

          <div class="card stat ring-stat fade-in">
            <app-ring [value]="progress?.completionPercentage ?? 0" [size]="84" [stroke]="9">
              <strong>{{ progress?.completionPercentage ?? 0 }}%</strong>
            </app-ring>
            <div>
              <div class="stat-top">Progreso semanal</div>
              <div class="stat-note"><strong>{{ progress?.completedWorkouts ?? 0 }}</strong> de {{ progress?.plannedWorkouts ?? 0 }} entrenamientos</div>
            </div>
          </div>

          <div class="card stat fade-in">
            <div class="stat-top"><span class="stat-icon" style="background: var(--info-50); color: var(--info)"><span class="material-icons">monitor_weight</span></span>Peso actual</div>
            <div class="stat-value">{{ latestWeight !== null ? latestWeight : '—' }}<small>kg</small></div>
            <div class="stat-note" *ngIf="weightDelta !== null">
              <span [style.color]="weightDelta <= 0 ? 'var(--brand-700)' : 'var(--accent-600)'">{{ weightDelta > 0 ? '+' : '' }}{{ weightDelta }} kg</span> desde el registro anterior
            </div>
            <div class="stat-note" *ngIf="weightDelta === null">Registra tu peso para ver tu evolución</div>
          </div>

          <div class="card stat fade-in">
            <div class="stat-top"><span class="stat-icon" style="background: var(--violet-50); color: var(--violet)"><span class="material-icons">stars</span></span>Nivel</div>
            <div class="stat-value">{{ avatar?.level ?? 1 }}<small>{{ avatar?.experience ?? 0 }} XP</small></div>
            <div class="progress" aria-hidden="true"><span [style.width.%]="xpPercent"></span></div>
            <div class="stat-note" *ngIf="avatar">Estado: {{ mood(avatar) }}</div>
          </div>
        </div>

        <!-- Weight chart + extreme challenge -->
        <div class="grid split section">
          <div class="card card-pad fade-in">
            <div class="card-head">
              <h3 class="card-title"><span class="material-icons">monitor_weight</span>Evolución del peso</h3>
              <a class="btn btn-ghost btn-sm" routerLink="/progreso">Ver progreso</a>
            </div>
            <app-line-chart [points]="weightPoints" unit=" kg" emptyText="Registra tu primer peso para ver el gráfico" ariaLabel="Evolución del peso corporal"></app-line-chart>
            <form class="weight-form" (ngSubmit)="saveWeight()">
              <input class="input" type="number" step="0.1" min="20" max="500" name="weight" placeholder="Tu peso de hoy (kg)" [(ngModel)]="newWeight">
              <button class="btn btn-primary" type="submit" [disabled]="newWeight === null || savingWeight">
                <span class="material-icons">add</span>Registrar
              </button>
            </form>
          </div>

          <div class="extreme card fade-in" *ngIf="extreme as e; else noExtreme">
            <div class="extreme-top">
              <span class="pill extreme-pill"><span class="material-icons">local_fire_department</span>Reto extremo del día</span>
              <span class="xp">+{{ e.xpReward }} XP</span>
            </div>
            <h3>{{ e.challenge.title }}</h3>
            <p>{{ e.challenge.description }}</p>
            <div class="extreme-meta"><span class="material-icons">category</span>{{ category(e) }}</div>
            <button class="btn btn-light" type="button" [disabled]="e.status === 'COMPLETED' || completing" (click)="completeExtreme()">
              <span class="material-icons">{{ e.status === 'COMPLETED' ? 'check_circle' : 'bolt' }}</span>
              {{ e.status === 'COMPLETED' ? '¡Completado! Vuelve mañana' : 'Marcar como completado' }}
            </button>
          </div>
          <ng-template #noExtreme>
            <div class="card card-pad empty"><span class="material-icons">bolt</span><p>No pudimos cargar el reto de hoy.</p></div>
          </ng-template>
        </div>

        <!-- Weekly progress + today's workout -->
        <div class="grid split section">
          <div class="card card-pad fade-in">
            <div class="card-head">
              <h3 class="card-title"><span class="material-icons">bar_chart</span>Cumplimiento semanal</h3>
            </div>
            <app-bar-chart [data]="barPoints" unit="%" emptyText="Completa tu primer entrenamiento para ver tu progreso" ariaLabel="Porcentaje de entrenamientos completados por semana"></app-bar-chart>
          </div>

          <div class="card card-pad today fade-in">
            <div class="card-head">
              <h3 class="card-title"><span class="material-icons">today</span>Hoy</h3>
              <span class="pill pill-gray">{{ todayLabel }}</span>
            </div>
            <ng-container *ngIf="todayRoutine as r; else rest">
              <ul class="ex-list">
                <li *ngFor="let ex of r.exercises"><span>{{ ex.name }}</span><span class="pill pill-green">{{ ex.sets }}x{{ ex.reps }}</span></li>
              </ul>
              <a class="btn" [ngClass]="todayDone ? 'btn-ghost' : 'btn-primary'" routerLink="/rutinas">
                <span class="material-icons">{{ todayDone ? 'check_circle' : 'play_arrow' }}</span>{{ todayDone ? 'Entrenamiento completado' : 'Empezar entrenamiento' }}
              </a>
            </ng-container>
            <ng-template #rest>
              <div class="empty"><span class="material-icons">spa</span><p>Hoy es día de descanso. Recupérate y vuelve con energía.</p></div>
            </ng-template>
          </div>
        </div>
      </ng-container>
    </div>
  `,
  styles: [`
    .hero { display: flex; justify-content: space-between; align-items: center; gap: 24px; padding: 28px; background: linear-gradient(135deg, #ffffff 0%, #f0fdf8 100%); overflow: hidden; }
    .eyebrow { color: var(--brand-700); font-weight: 700; font-size: 14px; }
    h1 { font-size: 34px; font-weight: 800; letter-spacing: -.02em; margin: 2px 0 6px; }
    .sub { color: var(--muted); font-size: 16px; }
    blockquote { margin: 14px 0 0; padding-left: 14px; border-left: 3px solid var(--brand); color: #334155; font-style: italic; max-width: 520px; }
    .hero-actions { display: flex; gap: 10px; flex-wrap: wrap; margin-top: 20px; }
    .hero-avatar { display: flex; flex-direction: column; align-items: center; gap: 6px; text-align: center; flex: none; }
    .hero-avatar small { color: var(--muted); font-size: 12.5px; }
    .section { margin-top: 16px; }
    .ring-stat { flex-direction: row; align-items: center; gap: 16px; }
    .ring-stat strong { font-size: 18px; }
    .weight-form { display: flex; gap: 10px; margin-top: 18px; }
    .weight-form .input { flex: 1; }
    .extreme { position: relative; overflow: hidden; padding: 24px; color: #fff; display: flex; flex-direction: column; gap: 12px; border: 0;
      background: radial-gradient(500px 240px at 100% 0%, rgba(255, 255, 255, .22), transparent 60%), linear-gradient(135deg, #fb923c 0%, #ea580c 55%, #c2410c 100%); }
    .extreme-top { display: flex; justify-content: space-between; align-items: center; gap: 8px; }
    .extreme-pill { background: rgba(255, 255, 255, .2); color: #fff; }
    .extreme-pill .material-icons { font-size: 16px; }
    .xp { font-weight: 800; font-size: 20px; }
    .extreme h3 { font-size: 22px; font-weight: 800; }
    .extreme p { opacity: .94; }
    .extreme-meta { display: flex; align-items: center; gap: 6px; font-size: 13px; opacity: .9; }
    .extreme .btn { margin-top: auto; align-self: flex-start; }
    .ex-list { list-style: none; margin: 0 0 16px; padding: 0; display: flex; flex-direction: column; gap: 8px; }
    .ex-list li { display: flex; justify-content: space-between; align-items: center; gap: 10px; padding: 10px 12px; background: var(--surface-2); border-radius: 12px; font-weight: 500; font-size: 14px; }
    .today .empty { padding: 20px 8px; }
    @media (max-width: 620px) {
      .ring-stat { flex-direction: column; align-items: flex-start; gap: 10px; }
      .stat-value { font-size: 24px; }
      .hero { flex-direction: column-reverse; align-items: flex-start; padding: 20px; }
      .hero-avatar { flex-direction: row; gap: 14px; text-align: left; }
      .hero-avatar app-character-avatar { transform: scale(.75); transform-origin: left center; margin-right: -30px; }
      h1 { font-size: 28px; }
    }
  `]
})
export class DashboardComponent implements OnInit {
  loading = true;
  avatar: Avatar | null = null;
  streak: Streak | null = null;
  progress: WeeklyProgress | null = null;
  history: WeeklyProgress[] = [];
  weights: BodyWeight[] = [];
  routines: RoutineDay[] = [];
  extreme: ChallengeAssignment | null = null;
  quote = '';
  newWeight: number | null = null;
  savingWeight = false;
  completing = false;

  readonly greeting = greeting();
  readonly firstName: string;
  readonly todayLabel = dayEs(todayDayOfWeek());

  constructor(
    private api: ApiService,
    auth: AuthService,
    private store: NotificationsStore,
    private toast: ToastService
  ) {
    this.firstName = (auth.user()?.name ?? '').split(' ')[0];
  }

  ngOnInit(): void {
    forkJoin({
      avatar: this.safe(this.api.getAvatar()),
      streak: this.safe(this.api.getStreak()),
      progress: this.safe(this.api.getCurrentProgress()),
      history: this.safe(this.api.getProgressHistory()),
      weights: this.safe(this.api.getBodyWeights()),
      routines: this.safe(this.api.getRoutines()),
      extreme: this.safe(this.api.requestDailyExtreme()),
      quote: this.safe(this.api.getRandomMessage())
    }).subscribe(r => {
      this.avatar = r.avatar;
      this.streak = r.streak;
      this.progress = r.progress;
      this.history = r.history ?? [];
      this.weights = r.weights ?? [];
      this.routines = r.routines ?? [];
      this.extreme = r.extreme;
      this.quote = r.quote?.text ?? '';
      this.loading = false;
    });
  }

  private safe<T>(source: Observable<T>): Observable<T | null> {
    return source.pipe(catchError(() => of(null)));
  }

  get xpPercent(): number {
    return this.avatar ? this.avatar.experience % 100 : 0;
  }

  get weightPoints(): ChartPoint[] {
    return this.weights.slice(-12).map(w => ({ label: shortDate(w.recordedOn), value: Number(w.weightKg) }));
  }

  get barPoints(): ChartPoint[] {
    return this.history.slice(-8).map(h => ({ label: shortDate(h.weekStart), value: h.completionPercentage }));
  }

  get latestWeight(): number | null {
    return this.weights.length ? Number(this.weights[this.weights.length - 1].weightKg) : null;
  }

  get weightDelta(): number | null {
    if (this.weights.length < 2) {
      return null;
    }
    const last = Number(this.weights[this.weights.length - 1].weightKg);
    const prev = Number(this.weights[this.weights.length - 2].weightKg);
    return Math.round((last - prev) * 10) / 10;
  }

  get todayRoutine(): RoutineDay | undefined {
    return this.routines.find(r => r.dayOfWeek === todayDayOfWeek());
  }

  get todayDone(): boolean {
    const r = this.todayRoutine;
    return !!r && !!this.progress && this.progress.completedRoutineDayIds.includes(r.id);
  }

  get subtitle(): string {
    if (this.todayRoutine && !this.todayDone) {
      return 'Hoy toca entrenar. ¡Tú puedes!';
    }
    if (this.todayDone) {
      return '¡Entrenamiento de hoy completado! Buen trabajo.';
    }
    return 'Hoy es día de descanso. Aprovecha para recuperarte.';
  }

  mood(a: Avatar): string {
    return moodEs(a.mood);
  }

  category(a: ChallengeAssignment): string {
    return categoryEs(a.challenge.category);
  }

  saveWeight(): void {
    if (this.newWeight === null) {
      return;
    }
    this.savingWeight = true;
    this.api.registerBodyWeight(this.newWeight).subscribe({
      next: () => {
        this.newWeight = null;
        this.savingWeight = false;
        this.toast.success('Peso registrado');
        this.api.getBodyWeights().subscribe(w => (this.weights = w));
      },
      error: err => {
        this.savingWeight = false;
        if (err?.status === 400) {
          this.toast.error('Ingresa un peso válido (entre 20 y 500 kg).');
        }
      }
    });
  }

  completeExtreme(): void {
    if (!this.extreme || this.extreme.status === 'COMPLETED') {
      return;
    }
    this.completing = true;
    this.api.completeChallenge(this.extreme.id).subscribe({
      next: done => {
        this.extreme = done;
        this.completing = false;
        this.toast.success(`¡Reto extremo completado! +${done.xpReward} XP`);
        this.api.getAvatar().subscribe(a => (this.avatar = a));
        this.api.getStreak().subscribe(s => (this.streak = s));
        this.store.refresh();
      },
      error: () => (this.completing = false)
    });
  }
}
