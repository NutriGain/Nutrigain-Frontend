import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { UserApiService } from '../../services/user-api.service';
import { MatCard } from '@angular/material/card';
import { MatError, MatFormField, MatInput, MatLabel } from '@angular/material/input';
import { MatButton } from '@angular/material/button';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCard,
    MatFormField,
    MatInput,
    MatButton,
    MatError,
    MatLabel
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  form!: FormGroup;
  errorMessage = '';
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private userService: UserApiService,
    private router: Router
  ) {}

  ngOnInit() {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });

    // Animación de entrada para los campos
    this.animateFormFields();
  }

  private animateFormFields() {
    // Pequeño delay para que las animaciones CSS funcionen correctamente
    setTimeout(() => {
      const fields = document.querySelectorAll('.mat-mdc-form-field');
      fields.forEach((field, index) => {
        setTimeout(() => {
          field.classList.add('animate-in');
        }, index * 100);
      });
    }, 100);
  }

  onSubmit() {
    if (this.form.invalid) {
      this.markFormGroupTouched();
      this.shakeCard();
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    const { email, password } = this.form.value;

    // Simulamos un delay para mostrar la animación de carga
    setTimeout(() => {
      this.userService.getUsers().subscribe({
        next: (users) => {
          const found = users.find(u => u.email === email && u.password === password);

          if (found) {
            // Animación de éxito
            this.showSuccessAnimation();

            // Navegamos después de la animación
            setTimeout(() => {
              this.router.navigate(['/dashboard']);
            }, 1000);
          } else {
            this.isLoading = false;
            this.errorMessage = 'Credenciales incorrectas. Verifica tu email y contraseña.';
            this.shakeCard();
          }
        },
        error: (error) => {
          this.isLoading = false;
          this.errorMessage = 'Error de conexión. Intenta nuevamente.';
          this.shakeCard();
          console.error('Error en login:', error);
        }
      });
    }, 800); // Reducido el delay
  }

  private markFormGroupTouched() {
    Object.keys(this.form.controls).forEach(key => {
      this.form.get(key)?.markAsTouched();
    });
  }

  private showSuccessAnimation() {
    const card = document.querySelector('.login-card');
    if (card) {
      card.classList.add('success-animation');

      // Cambiar temporalmente el texto del botón
      const button = document.querySelector('.login-button span');
      if (button) {
        button.textContent = '✅ ¡Bienvenido!';
      }
    }
  }

  private shakeCard() {
    const card = document.querySelector('.login-card');
    if (card) {
      card.classList.add('shake-animation');

      // Remover la clase después de la animación
      setTimeout(() => {
        card.classList.remove('shake-animation');
      }, 500);
    }
  }

  irARegistro() {
    // Animación de salida
    const card = document.querySelector('.login-card');
    if (card) {
      card.classList.add('slide-out');

      setTimeout(() => {
        this.router.navigate(['/register']);
      }, 300);
    }
  }

  // Método para manejar el focus en los campos
  onFieldFocus(fieldName: string) {
    const field = document.querySelector(`[formControlName="${fieldName}"]`);
    if (field) {
      field.parentElement?.classList.add('focused');
    }
  }

  // Método para manejar cuando se quita el focus
  onFieldBlur(fieldName: string) {
    const field = document.querySelector(`[formControlName="${fieldName}"]`);
    if (field) {
      field.parentElement?.classList.remove('focused');
    }
  }
}
