import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../../core/api.service';
import { Meal } from '../../core/models';
import { mealTypeEs } from '../../core/i18n';

@Component({
  standalone: true,
  selector: 'app-meal-detail',
  imports: [CommonModule],
  templateUrl: './meal-detail.component.html',
  styleUrls: ['./meal-detail.component.css']
})
export class MealDetailComponent implements OnInit {
  meal?: Meal;
  currentDot: number = 2;

  readonly typeLabel = mealTypeEs;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private api: ApiService
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.api.getMeal(id).subscribe({
      next: meal => (this.meal = meal),
      error: () => {
        this.showErrorAlert();
        this.router.navigate(['/manual']);
      }
    });
  }

  setActiveDot(index: number): void {
    this.currentDot = index;
  }

  goBack(): void {
    const container = document.querySelector('.container');
    if (container) {
      container.classList.add('fade-out');
      setTimeout(() => {
        this.router.navigate(['/manual']);
      }, 300);
    } else {
      this.router.navigate(['/manual']);
    }
  }

  private showErrorAlert(): void {
    const alertDiv = document.createElement('div');
    alertDiv.innerHTML = `
      <div style="
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: linear-gradient(45deg, #ff6b9d, #ff8fab);
        color: white;
        padding: 20px 30px;
        border-radius: 15px;
        box-shadow: 0 10px 30px rgba(0,0,0,0.3);
        z-index: 1000;
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        text-align: center;
      ">
        <h3 style="margin: 0 0 10px 0;">¡Oops!</h3>
        <p style="margin: 0;">No se encontró la comida seleccionada.</p>
      </div>
    `;
    document.body.appendChild(alertDiv);
    setTimeout(() => alertDiv.remove(), 3000);
  }
}
