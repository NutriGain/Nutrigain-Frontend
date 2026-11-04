import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { BottomNavbarComponent } from '../../shared/components/bottom-navbar/bottom-navbar.component';
import { ApiService } from '../../core/api.service';
import { AuthService } from '../../core/auth.service';
import { HealthSummary } from '../../core/models';

const CATEGORY_ES: Record<string, string> = {
  UNDERWEIGHT: 'Bajo peso',
  NORMAL: 'Peso normal',
  OVERWEIGHT: 'Sobrepeso',
  OBESE: 'Obesidad'
};

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, BottomNavbarComponent],
  template: `
    <div class="page">
      <h2 class="title">Mi perfil</h2>
      <p class="who">{{ user()?.name }} · {{ user()?.email }}</p>

      <div class="card metrics" *ngIf="summary">
        <div><span>Peso</span><strong>{{ summary.weightKg ?? '—' }} kg</strong></div>
        <div><span>IMC</span><strong>{{ summary.bmi ?? '—' }}</strong>
          <small *ngIf="summary.bmiCategory">{{ categoria(summary.bmiCategory) }}</small></div>
        <div><span>Calorías diarias</span><strong>{{ summary.dailyCalorieTarget ?? '—' }}</strong></div>
      </div>
      <p class="hint" *ngIf="summary && summary.bmi === null">
        Completa tu perfil y registra tu peso en el dashboard para ver tu IMC y tus calorías diarias.
      </p>

      <form class="card" [formGroup]="form" (ngSubmit)="guardar()">
        <label>Altura (cm)
          <input type="number" formControlName="heightCm" />
        </label>
        <label>Sexo
          <select formControlName="sex">
            <option value="MALE">Hombre</option>
            <option value="FEMALE">Mujer</option>
          </select>
        </label>
        <label>Nivel de actividad
          <select formControlName="activityLevel">
            <option value="SEDENTARY">Sedentario</option>
            <option value="LIGHT">Ligero</option>
            <option value="MODERATE">Moderado</option>
            <option value="ACTIVE">Activo</option>
          </select>
        </label>
        <button type="submit" [disabled]="form.invalid">Guardar</button>
        <p class="msg" *ngIf="mensaje">{{ mensaje }}</p>
      </form>
      <app-bottom-navbar></app-bottom-navbar>
    </div>
  `,
  styles: [`
    .page { min-height: 100vh; padding: 1.5rem 1.5rem 6rem; background: #f4e9e6; box-sizing: border-box; max-width: 600px; margin: 0 auto; }
    .title { text-align: center; font-size: 28px; font-weight: bold; color: #212529; margin-bottom: 4px; }
    .who { text-align: center; color: #555; }
    .card { background: #fff; border-radius: 12px; padding: 16px; margin-bottom: 16px; box-shadow: 0 2px 8px rgba(0,0,0,.1); display: flex; flex-direction: column; gap: 12px; }
    .metrics { flex-direction: row; justify-content: space-around; text-align: center; }
    .metrics div { display: flex; flex-direction: column; }
    .metrics span { color: #777; font-size: 13px; }
    .metrics strong { font-size: 22px; color: #4caf50; }
    label { display: flex; flex-direction: column; gap: 4px; font-weight: 500; }
    input, select { padding: 8px 10px; border-radius: 8px; border: 1px solid #ccc; }
    button { padding: 10px; border: none; border-radius: 8px; background: #4caf50; color: #fff; cursor: pointer; }
    button:disabled { opacity: .5; cursor: default; }
    .hint, .msg { color: #666; text-align: center; }
  `]
})
export class ProfileComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly api = inject(ApiService);
  private readonly auth = inject(AuthService);

  readonly user = this.auth.user;
  summary?: HealthSummary;
  mensaje = '';

  readonly form = this.fb.nonNullable.group({
    heightCm: [170, [Validators.required, Validators.min(100), Validators.max(250)]],
    sex: ['MALE' as 'MALE' | 'FEMALE', Validators.required],
    activityLevel: ['MODERATE' as 'SEDENTARY' | 'LIGHT' | 'MODERATE' | 'ACTIVE', Validators.required]
  });

  ngOnInit(): void {
    this.api.getProfile().subscribe(summary => {
      this.summary = summary;
      if (summary.heightCm && summary.sex && summary.activityLevel) {
        this.form.patchValue({
          heightCm: summary.heightCm,
          sex: summary.sex,
          activityLevel: summary.activityLevel
        });
      }
    });
  }

  categoria(code: string): string {
    return CATEGORY_ES[code] ?? code;
  }

  guardar(): void {
    this.mensaje = '';
    this.api.updateProfile(this.form.getRawValue()).subscribe({
      next: summary => {
        this.summary = summary;
        this.mensaje = 'Perfil guardado';
      },
      error: () => (this.mensaje = 'No se pudo guardar. Revisa los datos.')
    });
  }
}
