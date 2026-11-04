import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { MealService, Meal } from '../../services/meal.service';
import {environment} from '../../../environments/environment';

@Component({
  selector: 'app-manual-plan',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './manual-plan.component.html',
  styleUrls: ['./manual-plan.component.css']
})
export class ManualPlanComponent implements OnInit {
  meals: Meal[] = JSON.parse(localStorage.getItem('meals') || '[]');
  selectedMeals: number[] = JSON.parse(localStorage.getItem('selectedMeals') || '[]');

  showNotification = false;
  notificationMessage = '';
  notificationType: 'success' | 'error' | 'info' = 'success';

  mealTypes = ['Desayuno', 'Almuerzo', 'Cena', 'Snack'];
  selectedType = localStorage.getItem('selectedType') || 'Desayuno';

  availableMeals: Meal[] = [];

  constructor(
    private router: Router,
    private mealService: MealService,
    private http: HttpClient
  ) {}

  private readonly base = environment.apiUrl;
  ngOnInit(): void {
    const userId = 1;
    this.http.get<any[]>(`${this.base}/NutricionalManual?userId=${userId}`)
      .subscribe({
        next: (data) => {
          this.availableMeals = data;
          this.mealService.setAvailableMeals(data);
        },
        error: (err) => {
          console.error('Error al cargar los datos del JSON', err);
        }
      });
  }

  get filteredMeals(): Meal[] {
    return this.availableMeals.filter(m => m.type === this.selectedType);
  }

  get totalCalories(): number {
    return this.meals.reduce((total, meal) => total + meal.calories, 0);
  }

  get totalProteins(): number {
    return this.meals.reduce((total, meal) => total + meal.proteins, 0);
  }

  onTypeChange() {
    localStorage.setItem('selectedType', this.selectedType);
    this.showNotification = true;
    this.notificationMessage = `Mostrando comidas de ${this.selectedType}`;
    this.notificationType = 'info';
    this.hideNotificationAfterDelay();
  }

  viewDetail(id: number) {
    const button = document.querySelector(`button[onclick*="${id}"]`) as HTMLElement;
    if (button) {
      button.style.transform = 'scale(0.95)';
      setTimeout(() => {
        this.router.navigate(['/detail', id]);
      }, 150);
    } else {
      this.router.navigate(['/detail', id]);
    }
  }

  isAdded(id: number): boolean {
    return this.selectedMeals.includes(id);
  }

  addMeal(id: number) {
    const meal = this.availableMeals.find(m => m.id === id);
    if (meal && !this.meals.find(m => m.id === id)) {
      this.meals.push(meal);
      this.selectedMeals.push(id);
      localStorage.setItem('meals', JSON.stringify(this.meals));
      localStorage.setItem('selectedMeals', JSON.stringify(this.selectedMeals));

      this.showNotification = true;
      this.notificationMessage = `✅ ${meal.name} agregada al plan`;
      this.notificationType = 'success';
      this.hideNotificationAfterDelay();

      setTimeout(() => {
        const addedMealElements = document.querySelectorAll('.added-meal-item');
        const lastElement = addedMealElements[addedMealElements.length - 1] as HTMLElement;
        if (lastElement) {
          lastElement.classList.add('meal-added');
          setTimeout(() => {
            lastElement.classList.remove('meal-added');
          }, 600);
        }
      }, 50);
    }
  }

  removeMeal(id: number) {
    const meal = this.meals.find(m => m.id === id);
    if (meal) {
      const mealElements = document.querySelectorAll('.added-meal-item');
      const mealIndex = this.meals.findIndex(m => m.id === id);
      const elementToRemove = mealElements[mealIndex] as HTMLElement;

      if (elementToRemove) {
        elementToRemove.classList.add('meal-removed');

        setTimeout(() => {
          this.meals = this.meals.filter(m => m.id !== id);
          this.selectedMeals = this.selectedMeals.filter(mid => mid !== id);
          localStorage.setItem('meals', JSON.stringify(this.meals));
          localStorage.setItem('selectedMeals', JSON.stringify(this.selectedMeals));

          this.showNotification = true;
          this.notificationMessage = `❌ ${meal.name} removida del plan`;
          this.notificationType = 'error';
          this.hideNotificationAfterDelay();
        }, 400);
      } else {
        this.meals = this.meals.filter(m => m.id !== id);
        this.selectedMeals = this.selectedMeals.filter(mid => mid !== id);
        localStorage.setItem('meals', JSON.stringify(this.meals));
        localStorage.setItem('selectedMeals', JSON.stringify(this.selectedMeals));

        this.showNotification = true;
        this.notificationMessage = `❌ ${meal.name} removida del plan`;
        this.notificationType = 'error';
        this.hideNotificationAfterDelay();
      }
    }
  }

  private hideNotificationAfterDelay() {
    setTimeout(() => {
      this.showNotification = false;
    }, 3000);
  }

  closeNotification() {
    this.showNotification = false;
  }

  goBack() {
    const backButton = document.querySelector('.back-btn') as HTMLElement;
    if (backButton) {
      backButton.style.transform = 'scale(0.95)';
      backButton.innerHTML = '⏳ Cargando...';

      setTimeout(() => {
        this.router.navigate(['/nutricion']);
      }, 500);
    } else {
      this.router.navigate(['/nutricion']);
    }
  }

  trackByIndex(index: number, item: any): any {
    return index;
  }

  trackById(index: number, item: Meal): number {
    return item.id;
  }
}
