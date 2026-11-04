import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../../core/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="auth">
      <section class="auth-hero">
        <div class="brand"><span class="logo">N</span>NutriGain</div>
        <h1>Entrena a tu manera.<br>Mejora cada día.</h1>
        <p>Elige tu camino, sigue tu rutina y tu plan nutricional, y supera el reto diario extremo junto a tu personaje.</p>
        <ul>
          <li><span class="material-icons">fitness_center</span>Rutinas semanales según tu camino</li>
          <li><span class="material-icons">restaurant</span>Plan nutricional personalizado</li>
          <li><span class="material-icons">bolt</span>Retos y logros que te mantienen motivado</li>
        </ul>
      </section>

      <section class="auth-panel">
        <form class="auth-card fade-in" [formGroup]="form" (ngSubmit)="onSubmit()" novalidate>
          <h2>Bienvenido de nuevo</h2>
          <p class="muted">Inicia sesión para continuar con tu progreso</p>

          <label class="field">
            <span>Correo electrónico</span>
            <input type="email" formControlName="email" autocomplete="email" placeholder="tu@correo.com"
                   [class.invalid]="invalid('email')">
            <small class="err" *ngIf="invalid('email')">Ingresa un correo válido</small>
          </label>

          <label class="field">
            <span>Contraseña</span>
            <div class="input-wrap">
              <input [type]="showPassword ? 'text' : 'password'" formControlName="password" autocomplete="current-password"
                     placeholder="Tu contraseña" [class.invalid]="invalid('password')">
              <button class="toggle" type="button" (click)="showPassword = !showPassword"
                      [attr.aria-label]="showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'">
                <span class="material-icons">{{ showPassword ? 'visibility_off' : 'visibility' }}</span>
              </button>
            </div>
            <small class="err" *ngIf="invalid('password')">La contraseña debe tener al menos 6 caracteres</small>
          </label>

          <div class="alert alert-error" role="alert" *ngIf="errorMessage">{{ errorMessage }}</div>

          <button class="btn btn-primary btn-lg" type="submit" [disabled]="isLoading">
            {{ isLoading ? 'Ingresando…' : 'Iniciar sesión' }}
          </button>
          <p class="auth-switch">¿No tienes cuenta? <a routerLink="/register">Crear cuenta</a></p>
        </form>
      </section>
    </div>
  `
})
export class LoginComponent implements OnInit {
  form!: FormGroup;
  errorMessage = '';
  isLoading = false;
  showPassword = false;

  constructor(private fb: FormBuilder, private auth: AuthService, private router: Router) {}

  ngOnInit(): void {
    if (this.auth.isLoggedIn()) {
      this.router.navigate(['/dashboard']);
      return;
    }
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
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
    const { email, password } = this.form.value;
    this.auth.signIn(email, password).subscribe({
      next: () => this.router.navigate(['/dashboard']),
      error: error => {
        this.isLoading = false;
        this.errorMessage = error?.status === 401 || error?.status === 400
          ? 'Correo o contraseña incorrectos.'
          : 'No pudimos conectar con el servidor. Intenta nuevamente.';
      }
    });
  }
}
