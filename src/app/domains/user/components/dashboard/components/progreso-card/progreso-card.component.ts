import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { MatCardModule } from '@angular/material/card';
import { MatProgressBarModule } from '@angular/material/progress-bar';

@Component({
  selector: 'app-progreso-card',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatProgressBarModule],
  templateUrl: './progreso-card.component.html',
  styleUrls: ['./progreso-card.component.css']
})
export class ProgresoCardComponent implements OnInit {
  progreso: number = 0;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    const userId = 1;

    this.http.get<any[]>(`https://fake-api-murex-one.vercel.app/progresos?userId=${userId}`)
      .subscribe(data => {
        const ultimo = data[data.length - 1];
        this.progreso = ultimo?.porcentajeCompletado || 0;
      });
  }
}
