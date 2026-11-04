import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { MatCard } from '@angular/material/card';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { BottomNavbarComponent } from '../../../../shared/components/bottom-navbar/bottom-navbar.component';
import { trigger, state, style, transition, animate, keyframes } from '@angular/animations';
import {environment} from '../../../../../environments/environment';

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
  retos: any[] = [];
  retoActual: any;
  categorias: string[] = ['Todos', 'Ejercicio', 'Nutrición', 'Mindfulness', 'Productividad'];
  categoriaSeleccionada: string = 'Todos';
  animacionBoton: string = 'inactive';

  constructor(private http: HttpClient) {}

  private readonly base = environment.apiUrl;


  ngOnInit(): void {
    this.http.get<any[]>(`${this.base}/retos`)
      .subscribe(data => {
        this.retos = data.map(reto => ({
          ...reto,
          completado: false,
          // Asignar categoría aleatoria si no existe
          categoria: reto.categoria || this.getRandomCategoria()
        }));
        this.seleccionarRetoAleatorio();
      });
  }

  seleccionarRetoAleatorio(): void {
    this.animacionBoton = 'active';

    // Filtrar retos por categoría
    const retosFiltrados = this.categoriaSeleccionada === 'Todos'
      ? this.retos
      : this.retos.filter(reto => reto.categoria === this.categoriaSeleccionada);

    if (retosFiltrados.length > 0) {
      const index = Math.floor(Math.random() * retosFiltrados.length);
      this.retoActual = retosFiltrados[index];
    }

    // Resetear animación del botón
    setTimeout(() => {
      this.animacionBoton = 'inactive';
    }, 200);
  }

  seleccionarCategoria(categoria: string): void {
    this.categoriaSeleccionada = categoria;
    this.seleccionarRetoAleatorio();
  }

  marcarComoCompletado(): void {
    if (this.retoActual && !this.retoActual.completado) {
      this.retoActual.completado = true;

      // Encontrar el reto en el array principal y actualizarlo
      const index = this.retos.findIndex(r => r.id === this.retoActual.id);
      if (index !== -1) {
        this.retos[index].completado = true;
      }
    }
  }

  getDifficultyClass(dificultad: string): string {
    switch (dificultad?.toLowerCase()) {
      case 'fácil':
      case 'facil':
        return 'facil';
      case 'medio':
        return 'medio';
      case 'difícil':
      case 'dificil':
        return 'dificil';
      default:
        return 'facil';
    }
  }

  getProgreso(): number {
    if (this.retos.length === 0) return 0;
    const completados = this.retos.filter(reto => reto.completado).length;
    return (completados / this.retos.length) * 100;
  }

  getRetosCompletados(): number {
    return this.retos.filter(reto => reto.completado).length;
  }

  private getRandomCategoria(): string {
    const categoriasDisponibles = this.categorias.filter(c => c !== 'Todos');
    return categoriasDisponibles[Math.floor(Math.random() * categoriasDisponibles.length)];
  }
}
