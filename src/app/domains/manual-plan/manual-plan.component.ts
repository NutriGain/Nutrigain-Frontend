import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { ApiService } from '../../core/api.service';
import { Macros, Meal, MealType } from '../../core/models';
import { MEAL_TYPES, mealTypeEs } from '../../core/i18n';

@Component({
  selector: 'app-manual-plan',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './manual-plan.component.html',
  styleUrls: ['./manual-plan.component.css']
})
export class ManualPlanComponent implements OnInit {
  /** Meals the user picked for the manual plan (stored in the backend). */
  meals: Meal[] = [];
  totals: Macros = { calories: 0, proteins: 0, carbohydrates: 0, fats: 0 };
  availableMeals: Meal[] = [];

  showNotification = false;
  notificationMessage = '';
  notificationType: 'success' | 'error' | 'info' = 'success';

  readonly mealTypes = MEAL_TYPES;
  readonly typeLabel = mealTypeEs;
  selectedType: MealType = this.restoreSelectedType();

  constructor(private router: Router, private api: ApiService) {}

  ngOnInit(): void {
    forkJoin({ all: this.api.getMeals(), plan: this.api.getManualPlan() }).subscribe({
      next: ({ all, plan }) => {
        this.availableMeals = all;
        this.meals = plan.meals;
        this.totals = plan.totals;
      },
      error: () => this.notify('No se pudieron cargar las comidas', 'error')
    });
  }

  get filteredMeals(): Meal[] {
    return this.availableMeals.filter(m => m.mealType === this.selectedType);
  }

  get totalCalories(): number {
    return this.totals.calories;
  }

  get totalProteins(): number {
    return this.totals.proteins;
  }

  onTypeChange(): void {
    // Only a UI preference: it is fine to keep it in the browser.
    try {
      localStorage.setItem('selectedType', this.selectedType);
    } catch {
      // storage unavailable
    }
    this.notify(`Mostrando comidas de ${mealTypeEs(this.selectedType)}`, 'info');
  }

  viewDetail(id: number): void {
    this.router.navigate(['/detail', id]);
  }

  isAdded(id: number): boolean {
    return this.meals.some(m => m.id === id);
  }

  addMeal(id: number): void {
    const meal = this.availableMeals.find(m => m.id === id);
    this.api.addManualMeal(id).subscribe({
      next: plan => {
        this.meals = plan.meals;
        this.totals = plan.totals;
        this.notify(`✅ ${meal?.name ?? 'Comida'} agregada al plan`, 'success');
      },
      error: () => this.notify('No se pudo agregar la comida', 'error')
    });
  }

  removeMeal(id: number): void {
    const meal = this.meals.find(m => m.id === id);
    this.api.removeManualMeal(id).subscribe({
      next: plan => {
        this.meals = plan.meals;
        this.totals = plan.totals;
        this.notify(`❌ ${meal?.name ?? 'Comida'} removida del plan`, 'error');
      },
      error: () => this.notify('No se pudo quitar la comida', 'error')
    });
  }

  closeNotification(): void {
    this.showNotification = false;
  }

  goBack(): void {
    this.router.navigate(['/nutricion']);
  }

  trackById(index: number, item: Meal): number {
    return item.id;
  }

  private notify(message: string, type: 'success' | 'error' | 'info'): void {
    this.notificationMessage = message;
    this.notificationType = type;
    this.showNotification = true;
    setTimeout(() => (this.showNotification = false), 3000);
  }

  private restoreSelectedType(): MealType {
    try {
      const saved = localStorage.getItem('selectedType');
      if (saved && MEAL_TYPES.some(t => t.code === saved)) {
        return saved as MealType;
      }
    } catch {
      // storage unavailable
    }
    return 'BREAKFAST';
  }
}
