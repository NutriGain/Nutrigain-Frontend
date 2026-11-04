import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { forkJoin } from 'rxjs';
import { ApiService } from '../../../../core/api.service';
import { NotificationsStore } from '../../../../core/notifications.store';
import { ToastService } from '../../../../core/toast.service';
import { RoutineDay, WeeklyProgress } from '../../../../core/models';
import { shortDate, todayDayOfWeek } from '../../../../core/format';
import { dayEs } from '../../../../core/i18n';
import { RingComponent } from '../../../../shared/charts/ring.component';

@Component({
  selector: 'app-rutinas',
  standalone: true,
  imports: [CommonModule, RingComponent],
  template: `
    <div class="page">
      <div class="page-head">
        <div>
          <h1 class="page-title">Mis rutinas</h1>
          <p class="page-sub" *ngIf="progress">Semana del {{ weekStart }}</p>
        </div>
        <div class="week card" *ngIf="progress">
          <app-ring [value]="progress.completionPercentage" [size]="64" [stroke]="8"><strong>{{ progress.completionPercentage }}%</strong></app-ring>
          <div>
            <strong>{{ progress.completedWorkouts }} de {{ progress.plannedWorkouts }}</strong>
            <small>entrenamientos esta semana</small>
          </div>
        </div>
      </div>

      <div class="grid cols-2" *ngIf="loading">
        <div class="skeleton" style="height: 260px" *ngFor="let s of [1, 2, 3, 4]"></div>
      </div>

      <div class="empty card" *ngIf="!loading && routines.length === 0">
        <span class="material-icons">event_busy</span>
        <p>No encontramos rutinas para tu cuenta.</p>
      </div>

      <div class="grid cols-2">
        <article class="card day fade-in" *ngFor="let r of routines" [class.today]="isToday(r)" [class.done]="done(r.id)">
          <header>
            <div>
              <h3>{{ day(r) }}</h3>
              <small class="muted">{{ r.exercises.length }} ejercicios</small>
            </div>
            <div class="tags">
              <span class="pill pill-blue" *ngIf="isToday(r)">Hoy</span>
              <span class="pill pill-green" *ngIf="done(r.id)"><span class="material-icons">check</span>Completado</span>
            </div>
          </header>
          <ol>
            <li *ngFor="let e of r.exercises; let i = index">
              <span class="n">{{ i + 1 }}</span>
              <span class="name">{{ e.name }}</span>
              <span class="pill pill-gray">{{ e.sets }} x {{ e.reps }}</span>
            </li>
          </ol>
          <button class="btn" [ngClass]="done(r.id) ? 'btn-ghost' : 'btn-primary'" type="button"
                  [disabled]="done(r.id) || busyId === r.id" (click)="complete(r)">
            <span class="material-icons">{{ done(r.id) ? 'check_circle' : 'task_alt' }}</span>
            {{ done(r.id) ? 'Completado esta semana' : busyId === r.id ? 'Guardando…' : 'Marcar como hecho' }}
          </button>
        </article>
      </div>
    </div>
  `,
  styles: [`
    .week { display: flex; align-items: center; gap: 14px; padding: 12px 18px 12px 12px; }
    .week div:last-child { display: flex; flex-direction: column; }
    .week small { color: var(--muted); font-size: 12.5px; }
    .day { padding: 20px; display: flex; flex-direction: column; gap: 14px; transition: box-shadow .2s, transform .2s; }
    .day:hover { box-shadow: var(--shadow-lg); transform: translateY(-2px); }
    .day.today { border-color: var(--brand); box-shadow: 0 0 0 3px rgba(16, 185, 129, .12), var(--shadow); }
    header { display: flex; justify-content: space-between; align-items: flex-start; gap: 10px; }
    h3 { font-size: 19px; font-weight: 800; }
    .tags { display: flex; gap: 6px; flex-wrap: wrap; justify-content: flex-end; }
    .tags .material-icons { font-size: 14px; }
    ol { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 8px; }
    li { display: flex; align-items: center; gap: 12px; padding: 10px 12px; background: var(--surface-2); border-radius: 12px; }
    .n { width: 26px; height: 26px; border-radius: 8px; background: #fff; border: 1px solid var(--line); display: inline-flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 700; color: var(--muted); flex: none; }
    .name { flex: 1; font-weight: 600; font-size: 14.5px; }
    .day .btn { margin-top: auto; }
    .done ol { opacity: .7; }
  `]
})
export class RutinasComponent implements OnInit {
  routines: RoutineDay[] = [];
  progress: WeeklyProgress | null = null;
  loading = true;
  busyId: number | null = null;

  constructor(private api: ApiService, private store: NotificationsStore, private toast: ToastService) {}

  get weekStart(): string {
    return this.progress ? shortDate(this.progress.weekStart) : '';
  }

  ngOnInit(): void {
    forkJoin({ routines: this.api.getRoutines(), progress: this.api.getCurrentProgress() }).subscribe({
      next: ({ routines, progress }) => {
        this.routines = routines;
        this.progress = progress;
        this.loading = false;
      },
      error: () => (this.loading = false)
    });
  }

  day(r: RoutineDay): string {
    return dayEs(r.dayOfWeek);
  }

  isToday(r: RoutineDay): boolean {
    return r.dayOfWeek === todayDayOfWeek();
  }

  done(id: number): boolean {
    return this.progress?.completedRoutineDayIds.includes(id) ?? false;
  }

  complete(r: RoutineDay): void {
    this.busyId = r.id;
    this.api.completeWorkout(r.id).subscribe({
      next: progress => {
        this.progress = progress;
        this.busyId = null;
        this.toast.success('¡Entrenamiento completado! +20 XP');
        this.store.refresh();
      },
      error: () => {
        this.busyId = null;
        this.toast.error('No se pudo registrar el entrenamiento.');
      }
    });
  }
}
