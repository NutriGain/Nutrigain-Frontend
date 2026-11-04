import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../../core/auth.service';
import { ApiService } from '../../../../core/api.service';
import { FitnessPath } from '../../../../core/models';

const PATH_ICONS: Record<string, string> = {
  MUSCLE_GROWTH: 'fitness_center',
  AGILITY: 'bolt',
  YOGA: 'self_improvement'
};

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="auth">
      <section class="auth-hero">
        <div class="brand"><span class="logo">N</span>NutriGain</div>
        <h1>Tu camino fitness<br>empieza hoy.</h1>
        <p>Crea tu cuenta, elige tu camino y recibe al instante tu rutina semanal, tu plan nutricional y a tu personaje.</p>
        <ul>
          <li><span class="material-icons">route</span>Tres caminos: músculo, agilidad o yoga</li>
          <li><span class="material-icons">emoji_events</span>Un reto diario extremo que sube de nivel contigo</li>
          <li><span class="material-icons">groups</span>Compite y comparte progreso con amigos</li>
        </ul>
      </section>

      <section class="auth-panel">
        <form class="auth-card fade-in" [formGroup]="form" (ngSubmit)="onSubmit()" novalidate>
          <h2>Crea tu cuenta</h2>
          <p class="muted">Solo toma un minuto</p>

          <label class="field">
            <span>Nombre</span>
            <input type="text" formControlName="name" autocomplete="name" placeholder="Tu nombre" [class.invalid]="invalid('name')">
            <small class="err" *ngIf="invalid('name')">Ingresa al menos 2 caracteres</small>
          </label>

          <label class="field">
            <span>Correo electrónico</span>
            <input type="email" formControlName="email" autocomplete="email" placeholder="tu@correo.com" [class.invalid]="invalid('email')">
            <small class="err" *ngIf="invalid('email')">Ingresa un correo válido</small>
          </label>

          <div class="row">
            <label class="field">
              <span>Contraseña</span>
              <input type="password" formControlName="password" autocomplete="new-password" placeholder="Mínimo 6 caracteres"
                     [class.invalid]="invalid('password')">
              <small class="err" *ngIf="invalid('password')">Mínimo 6 caracteres</small>
            </label>
            <label class="field age">
              <span>Edad</span>
              <input type="number" formControlName="age" placeholder="18" [class.invalid]="invalid('age')">
              <small class="err" *ngIf="invalid('age')">13 a 100</small>
            </label>
          </div>

          <div class="field">
            <span>Elige tu camino</span>
            <div class="paths">
              <button type="button" class="path" *ngFor="let p of paths" [class.selected]="form.value.fitnessPathId === p.id"
                      (click)="selectPath(p.id)">
                <span class="material-icons">{{ icon(p.code) }}</span>
                <strong>{{ p.name }}</strong>
                <small>{{ p.description }}</small>
              </button>
              <div class="skeleton path-skeleton" *ngFor="let s of skeletons" [hidden]="paths.length > 0"></div>
            </div>
            <small class="err" *ngIf="invalid('fitnessPathId')">Selecciona un camino</small>
          </div>

          <div class="alert alert-error" role="alert" *ngIf="errorMessage">{{ errorMessage }}</div>

          <button class="btn btn-primary btn-lg" type="submit" [disabled]="isLoading">
            {{ isLoading ? 'Creando tu cuenta…' : 'Crear cuenta' }}
          </button>
          <p class="auth-switch">¿Ya tienes cuenta? <a routerLink="/login">Iniciar sesión</a></p>
        </form>
      </section>
    </div>
  `,
  styles: [`
    .row { display: grid; grid-template-columns: 1fr 96px; gap: 12px; }
    .paths { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 10px; }
    .path { display: flex; flex-direction: column; align-items: flex-start; gap: 4px; text-align: left; padding: 12px; border-radius: 14px; border: 1.5px solid var(--line); background: #fff; color: var(--text); transition: border-color .15s, background .15s; }
    .path:hover { border-color: #b6c2cf; }
    .path .material-icons { color: var(--brand-600); background: var(--brand-50); padding: 6px; border-radius: 10px; margin-bottom: 4px; }
    .path strong { font-size: 13.5px; }
    .path small { font-size: 11.5px; color: var(--muted); line-height: 1.35; }
    .path.selected { border-color: var(--brand); background: var(--brand-50); box-shadow: 0 0 0 3px rgba(16, 185, 129, .15); }
    .path-skeleton { height: 112px; }
    @media (max-width: 520px) { .paths { grid-template-columns: minmax(0, 1fr); } .path { flex-direction: row; align-items: center; flex-wrap: wrap; } .path small { width: 100%; } }
  `]
})
export class RegisterComponent implements OnInit {
  form!: FormGroup;
  paths: FitnessPath[] = [];
  readonly skeletons = [1, 2, 3];
  errorMessage = '';
  isLoading = false;

  constructor(private fb: FormBuilder, private auth: AuthService, private api: ApiService, private router: Router) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      age: [null, [Validators.required, Validators.min(13), Validators.max(100)]],
      fitnessPathId: [null, Validators.required]
    });
    this.api.getFitnessPaths().subscribe({
      next: paths => (this.paths = paths),
      error: () => (this.errorMessage = 'No pudimos cargar los caminos. Verifica tu conexión e intenta de nuevo.')
    });
  }

  icon(code: string): string {
    return PATH_ICONS[code] ?? 'sports';
  }

  selectPath(id: number): void {
    this.form.patchValue({ fitnessPathId: id });
    this.form.get('fitnessPathId')?.markAsTouched();
  }

  invalid(name: string): boolean {
    const c = this.form.get(name);
    return !!c && c.invalid && (c.touched || c.dirty);
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.isLoading = true;
    this.errorMessage = '';
    const { name, email, password, age, fitnessPathId } = this.form.value;

    this.auth.signUp({ name, email, password, age: Number(age), fitnessPathId: Number(fitnessPathId) }).subscribe({
      next: () =>
        // The account exists: sign in right away so the user lands on the dashboard.
        this.auth.signIn(email, password).subscribe({
          next: () => this.router.navigate(['/dashboard']),
          error: () => this.router.navigate(['/login'])
        }),
      error: error => {
        this.isLoading = false;
        this.errorMessage = error?.status === 409
          ? 'Ese correo ya está registrado. Prueba iniciando sesión.'
          : error?.error?.details?.[0] ?? 'No pudimos crear la cuenta. Intenta de nuevo.';
      }
    });
  }
}
