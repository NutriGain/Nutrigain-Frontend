import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCard } from '@angular/material/card';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { BottomNavbarComponent } from '../../../../shared/components/bottom-navbar/bottom-navbar.component';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { ApiService } from '../../../../core/api.service';
import { ChallengeAssignment, ChallengeCategory, Difficulty } from '../../../../core/models';
import { CATEGORIES, categoryEs, difficultyEs, todayIso } from '../../../../core/i18n';

@Component({
  selector: 'app-retos',
  standalone: true,
  imports: [CommonModule, MatCard, BottomNavbarComponent, MatButton, MatIcon],
  templateUrl: './retos.component.html',
  styleUrls: ['./retos.component.css'],
  animations: [
    trigger('slideInUp', [
      transition(':enter', [
        style({ transform: 'translateY(100px)', opacity: 0 }),
        animate('0.5s cubic-bezier(0.4, 0, 0.2, 1)',
          style({ transform: 'translateY(0)', opacity: 1 })
        )
      ]),
      transition(':leave', [
        animate('0.3s ease-in',
          style({ transform: 'translateY(-50px)', opacity: 0 })
        )
      ])
    ]),
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'scale(0.8)' }),
        animate('0.4s 0.2s ease-out',
          style({ opacity: 1, transform: 'scale(1)' })
        )
      ])
    ]),
    trigger('pulse', [
      state('active', style({ transform: 'scale(1.05)' })),
      state('inactive', style({ transform: 'scale(1)' })),
      transition('inactive => active', animate('0.2s ease-in')),
      transition('active => inactive', animate('0.2s ease-out'))
    ])
  ]
})
export class RetosComponent implements OnInit {
  readonly categorias = CATEGORIES;
  readonly categoriaEs = categoryEs;
  readonly dificultadEs = difficultyEs;

  categoriaSeleccionada: ChallengeCategory | null = null;
  animacionBoton = 'inactive';
  retoActual?: ChallengeAssignment;
  historial: ChallengeAssignment[] = [];
  error = '';

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.api.getMyChallenges().subscribe(lista => {
      this.historial = lista;
      this.retoActual = lista.find(a => a.status === 'PENDING');
      if (!this.retoActual) {
        this.nuevoReto();
      }
    });
  }

  nuevoReto(): void {
    this.animacionBoton = 'active';
    this.error = '';
    this.api.drawChallenge(this.categoriaSeleccionada).subscribe({
      next: asignacion => {
        this.retoActual = asignacion;
        this.historial = [asignacion, ...this.historial];
      },
      error: () => (this.error = 'No hay retos disponibles para esa categoría.')
    });
    setTimeout(() => (this.animacionBoton = 'inactive'), 200);
  }

  cargarExtremo(): void {
    this.error = '';
    this.api.requestDailyExtreme().subscribe(asignacion => {
      this.retoActual = asignacion;
      if (!this.historial.some(h => h.id === asignacion.id)) {
        this.historial = [asignacion, ...this.historial];
      }
    });
  }

  seleccionarCategoria(categoria: ChallengeCategory | null): void {
    this.categoriaSeleccionada = categoria;
    this.nuevoReto();
  }

  marcarComoCompletado(): void {
    if (!this.retoActual || this.retoActual.status === 'COMPLETED') {
      return;
    }
    this.api.completeChallenge(this.retoActual.id).subscribe({
      next: completado => {
        this.retoActual = completado;
        this.historial = this.historial.map(h => (h.id === completado.id ? completado : h));
      },
      error: () => (this.error = 'No se pudo completar el reto.')
    });
  }

  getDifficultyClass(dificultad: Difficulty): string {
    switch (dificultad) {
      case 'MEDIUM':
        return 'medio';
      case 'HARD':
      case 'EXTREME':
        return 'dificil';
      default:
        return 'facil';
    }
  }

  private retosDeHoy(): ChallengeAssignment[] {
    const hoy = todayIso();
    return this.historial.filter(h => h.assignedOn === hoy);
  }

  getRetosCompletados(): number {
    return this.retosDeHoy().filter(h => h.status === 'COMPLETED').length;
  }

  getTotalHoy(): number {
    return this.retosDeHoy().length;
  }

  getProgreso(): number {
    const total = this.getTotalHoy();
    return total === 0 ? 0 : (this.getRetosCompletados() / total) * 100;
  }
}
