import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Observable, catchError, forkJoin, of } from 'rxjs';
import { ApiService } from '../../../../core/api.service';
import { ToastService } from '../../../../core/toast.service';
import { BodyWeight, Streak, WeeklyProgress } from '../../../../core/models';
import { shortDate } from '../../../../core/format';
import { BarChartComponent } from '../../../../shared/charts/bar-chart.component';
import { ChartPoint, LineChartComponent } from '../../../../shared/charts/line-chart.component';

@Component({
  selector: 'app-progreso',
  standalone: true,
  imports: [CommonModule, FormsModule, BarChartComponent, LineChartComponent],
  template: `
    <div class="page">
      <div class="page-head">
        <div>
          <h1 class="page-title">Tu progreso</h1>
          <p class="page-sub">Entrenamientos, constancia y evolución de tu peso</p>
        </div>
      </div>

      <div class="grid cols-4">
        <div class="card stat">
          <div class="stat-top"><span class="stat-icon" style="background: var(--accent-50); color: var(--accent)"><span class="material-icons">local_fire_department</span></span>Racha actual</div>
          <div class="stat-value">{{ streak?.currentDays ?? 0 }}<small>{{ (streak?.currentDays ?? 0) === 1 ? 'día' : 'días' }}</small></div>
        </div>
        <div class="card stat">
          <div class="stat-top"><span class="stat-icon" style="background: var(--violet-50); color: var(--violet)"><span class="material-icons">emoji_events</span></span>Mejor racha</div>
          <div class="stat-value">{{ streak?.longestDays ?? 0 }}<small>{{ (streak?.longestDays ?? 0) === 1 ? 'día' : 'días' }}</small></div>
        </div>
        <div class="card stat">
          <div class="stat-top"><span class="stat-icon" style="background: var(--brand-50); color: var(--brand-600)"><span class="material-icons">fitness_center</span></span>Entrenamientos</div>
          <div class="stat-value">{{ totalWorkouts }}</div>
        </div>
        <div class="card stat">
          <div class="stat-top"><span class="stat-icon" style="background: var(--info-50); color: var(--info)"><span class="material-icons">insights</span></span>Mejor semana</div>
          <div class="stat-value">{{ bestWeek }}<small>%</small></div>
        </div>
      </div>

      <div class="grid split charts">
        <div class="card card-pad">
          <div class="card-head"><h3 class="card-title"><span class="material-icons">bar_chart</span>Cumplimiento por semana</h3></div>
          <app-bar-chart [data]="barPoints" unit="%" emptyText="Aún no hay semanas registradas" ariaLabel="Porcentaje de cumplimiento por semana"></app-bar-chart>
        </div>

        <div class="card card-pad">
          <div class="card-head"><h3 class="card-title"><span class="material-icons">monitor_weight</span>Registrar peso</h3></div>
          <form class="weight-form" (ngSubmit)="saveWeight()">
            <input class="input" type="number" step="0.1" min="20" max="500" name="weight" placeholder="Peso de hoy (kg)" [(ngModel)]="newWeight">
            <button class="btn btn-primary" type="submit" [disabled]="newWeight === null || saving">Guardar</button>
          </form>
          <ul class="history" *ngIf="recentWeights.length; else noWeights">
            <li *ngFor="let w of recentWeights"><span>{{ date(w.recordedOn) }}</span><strong>{{ w.weightKg }} kg</strong></li>
          </ul>
          <ng-template #noWeights><p class="muted small">Aún no has registrado tu peso.</p></ng-template>
        </div>
      </div>

      <div class="card card-pad weight-card">
        <div class="card-head"><h3 class="card-title"><span class="material-icons">show_chart</span>Evolución del peso</h3></div>
        <app-line-chart [points]="weightPoints" unit=" kg" emptyText="Registra tu peso para ver cómo evoluciona" ariaLabel="Evolución del peso corporal"></app-line-chart>
      </div>
    </div>
  `,
  styles: [`
    .charts, .weight-card { margin-top: 16px; }
    .weight-form { display: flex; gap: 10px; margin-bottom: 14px; }
    .weight-form .input { flex: 1; }
    .history { list-style: none; margin: 0; padding: 0; max-height: 220px; overflow-y: auto; }
    .history li { display: flex; justify-content: space-between; padding: 10px 2px; border-bottom: 1px solid #f1f4f8; font-size: 14px; }
    .small { font-size: 14px; }
  `]
})
export class ProgresoComponent implements OnInit {
  history: WeeklyProgress[] = [];
  weights: BodyWeight[] = [];
  streak: Streak | null = null;
  newWeight: number | null = null;
  saving = false;

  constructor(private api: ApiService, private toast: ToastService) {}

  ngOnInit(): void {
    forkJoin({
      history: this.safe(this.api.getProgressHistory()),
      weights: this.safe(this.api.getBodyWeights()),
      streak: this.safe(this.api.getStreak())
    }).subscribe(r => {
      this.history = r.history ?? [];
      this.weights = r.weights ?? [];
      this.streak = r.streak;
    });
  }

  private safe<T>(source: Observable<T>): Observable<T | null> {
    return source.pipe(catchError(() => of(null)));
  }

  get barPoints(): ChartPoint[] {
    return this.history.slice(-12).map(h => ({ label: shortDate(h.weekStart), value: h.completionPercentage }));
  }

  get weightPoints(): ChartPoint[] {
    return this.weights.slice(-20).map(w => ({ label: shortDate(w.recordedOn), value: Number(w.weightKg) }));
  }

  get recentWeights(): BodyWeight[] {
    return [...this.weights].reverse().slice(0, 12);
  }

  get totalWorkouts(): number {
    return this.history.reduce((sum, h) => sum + h.completedWorkouts, 0);
  }

  get bestWeek(): number {
    return this.history.reduce((best, h) => Math.max(best, h.completionPercentage), 0);
  }

  date(iso: string): string {
    return shortDate(iso);
  }

  saveWeight(): void {
    if (this.newWeight === null) {
      return;
    }
    this.saving = true;
    this.api.registerBodyWeight(this.newWeight).subscribe({
      next: () => {
        this.newWeight = null;
        this.saving = false;
        this.toast.success('Peso registrado');
        this.api.getBodyWeights().subscribe(w => (this.weights = w));
      },
      error: err => {
        this.saving = false;
        if (err?.status === 400) {
          this.toast.error('Ingresa un peso válido (entre 20 y 500 kg).');
        }
      }
    });
  }
}
