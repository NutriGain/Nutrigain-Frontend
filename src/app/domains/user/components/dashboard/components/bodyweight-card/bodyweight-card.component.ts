import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Color, NgxChartsModule, ScaleType } from '@swimlane/ngx-charts';
import {MatCard} from '@angular/material/card';

@Component({
  selector: 'app-bodyweight-card',
  standalone: true,
  imports: [CommonModule, NgxChartsModule, MatCard],
  templateUrl: './bodyweight-card.component.html',
  styleUrls: ['./bodyweight-card.component.css']
})
export class BodyweightCardComponent implements OnInit {
  data: any[] = [];
  view: [number, number] = [700, 300]; // default desktop size

  colorScheme: Color = {
    name: 'custom',
    selectable: true,
    group: ScaleType.Ordinal,
    domain: ['#4caf50']
  };

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.setResponsiveView(); // ajusta tamaño desde el inicio

    const userId = 1;
    this.http.get<any[]>(`https://fake-api-murex-one.vercel.app/pesos?userId=${userId}`).subscribe(pesos => {
      if (pesos?.length) {
        this.data = [{
          name: 'Peso',
          series: pesos.map(p => ({
            name: `Semana ${p.semana}`,
            value: p.peso
          }))
        }];
      }
    });
  }

  // Escuchar cambios de tamaño de pantalla
  @HostListener('window:resize')
  onResize() {
    this.setResponsiveView();
  }

  private setResponsiveView(): void {
    const width = window.innerWidth;
    if (width < 600) {
      this.view = [320, 250];
    } else if (width < 900) {
      this.view = [500, 280];
    } else {
      this.view = [700, 300];
    }
  }
}
