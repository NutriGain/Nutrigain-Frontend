import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Observable, catchError, forkJoin, of } from 'rxjs';
import { ApiService } from '../../core/api.service';
import { AuthService } from '../../core/auth.service';
import { NotificationsStore } from '../../core/notifications.store';
import { ToastService } from '../../core/toast.service';
import { Avatar, HealthSummary, Streak } from '../../core/models';
import { moodEs } from '../../core/i18n';
import { CharacterAvatarComponent } from '../../shared/ui/character-avatar.component';

const BMI_LABEL: Record<string, string> = {
  UNDERWEIGHT: 'Bajo peso',
  NORMAL: 'Peso normal',
  OVERWEIGHT: 'Sobrepeso',
  OBESE: 'Obesidad'
};

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, CharacterAvatarComponent],
  template: `
    <div class="page">
      <section class="card head fade-in">
        <app-character-avatar *ngIf="avatar" [name]="avatar.characterName" [level]="avatar.level" [percent]="avatar.experience % 100" [size]="128"></app-character-avatar>
        <div class="who">
          <h1>{{ user()?.name }}</h1>
          <p class="muted">{{ user()?.email }} · {{ user()?.age }} años</p>
          <div class="chips" *ngIf="avatar">
            <span class="pill pill-violet"><span class="material-icons">stars</span>Nivel {{ avatar.level }}</span>
            <span class="pill pill-green">{{ avatar.experience }} XP</span>
            <span class="pill pill-orange" *ngIf="streak"><span class="material-icons">local_fire_department</span>{{ streak.currentDays }} {{ streak.currentDays === 1 ? 'día' : 'días' }} de racha</span>
            <span class="pill pill-blue">{{ mood(avatar) }}</span>
          </div>
          <div class="xp" *ngIf="avatar">
            <div class="progress"><span [style.width.%]="avatar.experience % 100"></span></div>
            <small class="muted">{{ avatar.experienceToNextLevel }} XP para el nivel {{ avatar.level + 1 }} · tu compañero es {{ avatar.characterName }}</small>
          </div>
        </div>
        <button type="button" class="btn btn-danger-ghost" (click)="logout()"><span class="material-icons">logout</span>Cerrar sesión</button>
      </section>

      <div class="grid split body">
        <form class="card card-pad" [formGroup]="form" (ngSubmit)="save()">
          <div class="card-head"><h3 class="card-title"><span class="material-icons">tune</span>Datos para tus métricas</h3></div>
          <p class="muted intro">Con tu altura, sexo y actividad calculamos tu IMC y tus calorías diarias recomendadas.</p>

          <label class="field">
            <span>Altura (cm)</span>
            <input type="number" formControlName="heightCm" placeholder="170" [class.invalid]="form.controls.heightCm.invalid && form.controls.heightCm.touched">
            <small class="err" *ngIf="form.controls.heightCm.invalid && form.controls.heightCm.touched">Ingresa una altura entre 100 y 250 cm</small>
          </label>

          <div class="field">
            <span>Sexo</span>
            <div class="tabs seg">
              <button type="button" [class.active]="form.value.sex === 'MALE'" (click)="form.patchValue({ sex: 'MALE' })">Hombre</button>
              <button type="button" [class.active]="form.value.sex === 'FEMALE'" (click)="form.patchValue({ sex: 'FEMALE' })">Mujer</button>
            </div>
          </div>

          <label class="field">
            <span>Nivel de actividad</span>
            <select formControlName="activityLevel">
              <option value="SEDENTARY">Sedentario (poco o nada de ejercicio)</option>
              <option value="LIGHT">Ligero (1-3 días por semana)</option>
              <option value="MODERATE">Moderado (3-5 días por semana)</option>
              <option value="ACTIVE">Activo (6-7 días por semana)</option>
            </select>
          </label>

          <button class="btn btn-primary" type="submit" [disabled]="form.invalid || saving">{{ saving ? 'Guardando…' : 'Guardar cambios' }}</button>
        </form>

        <section class="card card-pad metrics" *ngIf="summary">
          <div class="card-head"><h3 class="card-title"><span class="material-icons">monitor_heart</span>Tus métricas</h3></div>

          <div class="metric">
            <span class="muted">Peso actual</span>
            <strong>{{ summary.weightKg ?? '—' }}<small *ngIf="summary.weightKg"> kg</small></strong>
          </div>

          <div class="metric">
            <span class="muted">Índice de masa corporal</span>
            <strong>{{ summary.bmi ?? '—' }}</strong>
            <span class="pill" *ngIf="summary.bmiCategory as c" [ngClass]="bmiPill(c)">{{ bmiLabel(c) }}</span>
            <div class="scale" *ngIf="summary.bmi !== null" aria-hidden="true">
              <div class="bar"><i style="background: #60a5fa; flex: 3.5"></i><i style="background: #34d399; flex: 6.5"></i><i style="background: #fbbf24; flex: 5"></i><i style="background: #f87171; flex: 5"></i></div>
              <span class="marker" [style.left.%]="bmiPosition"></span>
            </div>
          </div>

          <div class="metric">
            <span class="muted">Calorías diarias recomendadas</span>
            <strong>{{ summary.dailyCalorieTarget ?? '—' }}<small *ngIf="summary.dailyCalorieTarget"> kcal</small></strong>
          </div>

          <p class="hint muted" *ngIf="summary.bmi === null">
            Guarda tus datos y registra tu peso en Progreso para ver tu IMC y tus calorías.
          </p>
        </section>
      </div>
    </div>
  `,
  styles: [`
    .head { display: flex; align-items: center; gap: 24px; padding: 24px; flex-wrap: wrap; }
    .who { flex: 1; min-width: 240px; display: flex; flex-direction: column; gap: 8px; }
    h1 { font-size: 28px; font-weight: 800; }
    .chips .material-icons { font-size: 14px; }
    .xp { max-width: 420px; display: flex; flex-direction: column; gap: 6px; margin-top: 4px; }
    .body { margin-top: 16px; align-items: start; }
    .intro { font-size: 14px; margin: -6px 0 16px; }
    .seg { display: flex; }
    .seg button { flex: 1; }
    .metric { padding: 14px 0; border-bottom: 1px solid #f1f4f8; display: flex; flex-direction: column; gap: 4px; align-items: flex-start; }
    .metric:last-of-type { border-bottom: 0; }
    .metric strong { font-size: 30px; font-weight: 800; letter-spacing: -.02em; }
    .metric small { font-size: 14px; color: var(--muted); font-weight: 600; }
    .scale { position: relative; width: 100%; margin-top: 10px; }
    .bar { display: flex; height: 10px; border-radius: 999px; overflow: hidden; gap: 2px; }
    .bar i { display: block; }
    .marker { position: absolute; top: -5px; width: 4px; height: 20px; border-radius: 2px; background: #0f172a; transform: translateX(-50%); box-shadow: 0 0 0 2px #fff; }
    .hint { font-size: 14px; margin-top: 8px; }
  `]
})
export class ProfileComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly api = inject(ApiService);
  private readonly auth = inject(AuthService);
  private readonly store = inject(NotificationsStore);
  private readonly toast = inject(ToastService);

  readonly user = this.auth.user;
  summary: HealthSummary | null = null;
  avatar: Avatar | null = null;
  streak: Streak | null = null;
  saving = false;

  readonly form = this.fb.nonNullable.group({
    heightCm: [170, [Validators.required, Validators.min(100), Validators.max(250)]],
    sex: ['MALE' as 'MALE' | 'FEMALE', Validators.required],
    activityLevel: ['MODERATE' as 'SEDENTARY' | 'LIGHT' | 'MODERATE' | 'ACTIVE', Validators.required]
  });

  ngOnInit(): void {
    forkJoin({
      summary: this.safe(this.api.getProfile()),
      avatar: this.safe(this.api.getAvatar()),
      streak: this.safe(this.api.getStreak())
    }).subscribe(r => {
      this.summary = r.summary;
      this.avatar = r.avatar;
      this.streak = r.streak;
      const s = r.summary;
      if (s?.heightCm && s.sex && s.activityLevel) {
        this.form.patchValue({ heightCm: s.heightCm, sex: s.sex, activityLevel: s.activityLevel });
      }
    });
  }

  private safe<T>(source: Observable<T>): Observable<T | null> {
    return source.pipe(catchError(() => of(null)));
  }

  mood(a: Avatar): string {
    return moodEs(a.mood);
  }

  bmiLabel(code: string): string {
    return BMI_LABEL[code] ?? code;
  }

  bmiPill(code: string): string {
    return code === 'NORMAL' ? 'pill-green' : code === 'UNDERWEIGHT' ? 'pill-blue' : code === 'OVERWEIGHT' ? 'pill-orange' : 'pill-red';
  }

  /** Position of the marker on a 15 to 35 BMI scale. */
  get bmiPosition(): number {
    const bmi = this.summary?.bmi ?? 0;
    return Math.min(100, Math.max(0, ((bmi - 15) / 20) * 100));
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.saving = true;
    this.api.updateProfile(this.form.getRawValue()).subscribe({
      next: summary => {
        this.summary = summary;
        this.saving = false;
        this.toast.success('Perfil actualizado');
      },
      error: () => {
        this.saving = false;
        this.toast.error('No se pudo guardar. Revisa los datos.');
      }
    });
  }

  logout(): void {
    this.store.clear();
    this.auth.logout();
  }
}
