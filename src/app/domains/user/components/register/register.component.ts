import  { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { UserApiService } from '../../services/user-api.service';
import { Router } from '@angular/router';
import { User } from '../../data/internal/user.model';

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
    private userService: UserApiService,
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
      // Marcar todos los campos como touched para mostrar errores
      Object.keys(this.form.controls).forEach(key => {
        this.form.get(key)?.markAsTouched();
      });
      this.mensajeError = 'Por favor, corrige los errores en el formulario';
      return;
    }

    const newUser: User = {
      ...this.form.value,
      id: Date.now() // simulamos ID único
    };

    this.userService.createUser(newUser).subscribe({
      next: () => {
        this.successMessage = 'Usuario registrado exitosamente. Redirigiendo...';
        this.mensajeError = '';

        // Redireccionar después de 2 segundos
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 2000);
      },
      error: (error) => {
        console.error('Error al registrar:', error);
        this.mensajeError = 'Error al registrar el usuario. Intenta nuevamente.';
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
