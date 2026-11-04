import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../../../core/api.service';
import { AuthService } from '../../../../core/auth.service';
import { Avatar, ChallengeAssignment, PlannedMeal } from '../../../../core/models';
import { difficultyEs, mealTypeEs } from '../../../../core/i18n';

@Component({
  selector: 'app-resumen',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './resumen.component.html',
  styleUrls: ['./resumen.component.css']
})
export class ResumenComponent implements OnInit {
  avatar?: Avatar;
  progreso = 0;
  progresoCompleto = false;
  ultimaComida?: PlannedMeal;
  reto?: ChallengeAssignment;

  private readonly api = inject(ApiService);
  private readonly auth = inject(AuthService);

  readonly user = this.auth.user;
  readonly tipoEs = mealTypeEs;
  readonly dificultadEs = difficultyEs;

  ngOnInit(): void {
    this.api.getAvatar().subscribe(a => (this.avatar = a));

    this.api.getCurrentProgress().subscribe(p => {
      this.progreso = p.completionPercentage;
      this.progresoCompleto = p.completionPercentage === 100;
    });

    this.api.getNutritionPlan().subscribe(plan => {
      const ultimoDia = plan.days[plan.days.length - 1];
      this.ultimaComida = ultimoDia?.meals[ultimoDia.meals.length - 1];
    });

    this.api.requestDailyExtreme().subscribe(r => (this.reto = r));
  }
}
