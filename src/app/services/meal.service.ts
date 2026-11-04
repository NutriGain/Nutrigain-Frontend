// src/app/services/meal.service.ts
import { Injectable } from '@angular/core';

export interface Meal {
  id: number;
  name: string;
  type: string;
  calories: number;
  proteins: number;
  carbohydrates: number;
  fats: number;
  image: string;
}

@Injectable({ providedIn: 'root' })
export class MealService {
  private availableMeals: Meal[] = JSON.parse(localStorage.getItem('availableMeals') || '[]');

  getMealById(id: number): Meal | undefined {
    return this.availableMeals.find(meal => meal.id === id);
  }

  setAvailableMeals(meals: Meal[]): void {
    this.availableMeals = meals;
    localStorage.setItem('availableMeals', JSON.stringify(meals));
  }

  getMeals(): Meal[] {
    return this.availableMeals;
  }
}
