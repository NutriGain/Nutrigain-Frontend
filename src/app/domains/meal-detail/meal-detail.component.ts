import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MealService, Meal } from '../../services/meal.service';

@Component({
  standalone: true,
  selector: 'app-meal-detail',
  imports: [CommonModule],
  templateUrl: './meal-detail.component.html',
  styleUrls: ['./meal-detail.component.css']
})
export class MealDetailComponent implements OnInit {
  meal?: Meal;
  currentDot: number = 2; // Dot activo por defecto (el tercero como en tu diseño original)

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private mealService: MealService
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.meal = this.mealService.getMealById(id);

    if (!this.meal) {
      this.showErrorAlert();
      this.router.navigate(['/manual-plan']);
    }
  }

  setActiveDot(index: number): void {
    this.currentDot = index;
  }

  goBack(): void {
    // Añadir una pequeña animación antes de navegar
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
    // Crear una alerta personalizada más elegante que alert()
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
        animation: slideIn 0.3s ease-out;
      ">
        <h3 style="margin: 0 0 10px 0;">¡Oops!</h3>
        <p style="margin: 0;">No se encontró la comida seleccionada.</p>
      </div>
    `;

    // Añadir estilos de animación
    const style = document.createElement('style');
    style.textContent = `
      @keyframes slideIn {
        from {
          opacity: 0;
          transform: translate(-50%, -50%) scale(0.8);
        }
        to {
          opacity: 1;
          transform: translate(-50%, -50%) scale(1);
        }
      }
    `;
    document.head.appendChild(style);
    document.body.appendChild(alertDiv);

    // Remover después de 3 segundos
    setTimeout(() => {
      if (alertDiv.parentNode) {
        alertDiv.remove();
      }
      if (style.parentNode) {
        style.remove();
      }
    }, 3000);
  }
}
