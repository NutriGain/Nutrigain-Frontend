import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../../core/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  form!: FormGroup;
  successMessage = '';
  mensajeError = '';

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router
  ) {
    this.form = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      edad: ['', [Validators.required, Validators.min(13), Validators.max(100)]],
      caminoSeleccionado: ['', Validators.required],
    });
  }

  onSubmit() {
    if (this.form.invalid) {
      Object.keys(this.form.controls).forEach(key => {
        this.form.get(key)?.markAsTouched();
      });
      this.mensajeError = 'Por favor, corrige los errores en el formulario';
      return;
    }

    const { nombre, email, password, edad, caminoSeleccionado } = this.form.value;

    this.auth.signUp({
      name: nombre,
      email,
      password,
      age: Number(edad),
      fitnessPathId: Number(caminoSeleccionado)
    }).subscribe({
      next: () => {
        this.successMessage = 'Usuario registrado exitosamente. Redirigiendo...';
        this.mensajeError = '';
        setTimeout(() => this.router.navigate(['/login']), 2000);
      },
      error: (error) => {
        this.mensajeError = error?.status === 409
          ? 'Ese correo ya está registrado.'
          : error?.error?.details?.[0] ?? 'Error al registrar el usuario. Intenta nuevamente.';
        this.successMessage = '';
      }
    });
  }

  irALogin() {
    this.router.navigate(['/login']);
  }

  // Método para limpiar mensajes cuando el usuario empiece a escribir
  onFormChange() {
    this.mensajeError = '';
    this.successMessage = '';
  }
}
