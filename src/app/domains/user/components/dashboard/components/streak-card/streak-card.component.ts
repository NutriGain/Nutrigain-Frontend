import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-streak-card',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule],
  templateUrl: './streak-card.component.html',
  styleUrls: ['./streak-card.component.css']
})
export class StreakCardComponent implements OnInit {
  racha: number = 0;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    const userId = 1;

    this.http.get<any[]>(`https://fake-api-murex-one.vercel.app/progresos?userId=${userId}`)
      .subscribe(data => {
        const ordenado = [...data].sort((a, b) => b.semana - a.semana);
        this.racha = this.calcularRacha(ordenado);
      });
  }

  calcularRacha(progresos: any[]): number {
    let racha = 0;

    for (let i = 0; i < progresos.length; i++) {
      if (progresos[i].porcentajeCompletado > 0) {
        racha++;
      } else {
        break; // se corta la racha
      }
    }

    return racha;
  }
}
