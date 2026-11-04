import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { forkJoin } from 'rxjs';
import { BottomNavbarComponent } from '../../../../shared/components/bottom-navbar/bottom-navbar.component';
import { ApiService } from '../../../../core/api.service';
import { RoutineDay, WeeklyProgress } from '../../../../core/models';
import { dayEs } from '../../../../core/i18n';

@Component({
  selector: 'app-rutinas',
  standalone: true,
  imports: [CommonModule, BottomNavbarComponent],
  templateUrl: './rutinas.component.html',
  styleUrls: ['./rutinas.component.css']
})
export class RutinasComponent implements OnInit {
  rutinas: RoutineDay[] = [];
  progreso?: WeeklyProgress;
  error = '';

  readonly diaEs = dayEs;

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    forkJoin({ rutinas: this.api.getRoutines(), progreso: this.api.getCurrentProgress() })
      .subscribe(({ rutinas, progreso }) => {
        this.rutinas = rutinas;
        this.progreso = progreso;
      });
  }

  hecho(routineDayId: number): boolean {
    return this.progreso?.completedRoutineDayIds.includes(routineDayId) ?? false;
  }

  completar(rutina: RoutineDay): void {
    this.error = '';
    this.api.completeWorkout(rutina.id).subscribe({
      next: progreso => (this.progreso = progreso),
      error: () => (this.error = 'No se pudo registrar el entrenamiento. Intenta de nuevo.')
    });
  }
}
