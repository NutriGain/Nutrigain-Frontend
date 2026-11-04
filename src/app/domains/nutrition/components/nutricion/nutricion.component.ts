import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../../../core/api.service';
import { NutritionPlan } from '../../../../core/models';
import { dayEs, mealTypeEs, mealTypeIcon } from '../../../../core/i18n';

@Component({
  selector: 'app-nutricion',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './nutricion.component.html',
  styleUrls: ['./nutricion.component.css']
})
export class NutricionComponent implements OnInit {
  plan?: NutritionPlan;
  error = '';

  readonly diaEs = dayEs;
  readonly tipoEs = mealTypeEs;
  readonly icono = mealTypeIcon;

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.api.getNutritionPlan().subscribe({
      next: plan => (this.plan = plan),
      error: () => (this.error = 'No se pudo cargar tu plan nutricional.')
    });
  }

  volver(): void {
    window.history.back();
  }
}
