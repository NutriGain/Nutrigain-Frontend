import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Color, NgxChartsModule, ScaleType } from '@swimlane/ngx-charts';
import { MatCard } from '@angular/material/card';
import { ApiService } from '../../../../../../core/api.service';

@Component({
  selector: 'app-bodyweight-card',
  standalone: true,
  imports: [CommonModule, FormsModule, NgxChartsModule, MatCard],
  templateUrl: './bodyweight-card.component.html',
  styleUrls: ['./bodyweight-card.component.css']
})
export class BodyweightCardComponent implements OnInit {
  data: { name: string; series: { name: string; value: number }[] }[] = [];
  view: [number, number] = [700, 300];
  nuevoPeso: number | null = null;
  error = '';

  colorScheme: Color = {
    name: 'custom',
    selectable: true,
    group: ScaleType.Ordinal,
    domain: ['#4caf50']
  };

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.setResponsiveView();
    this.cargar();
  }

  registrarPeso(): void {
    if (this.nuevoPeso === null) {
      return;
    }
    this.error = '';
    this.api.registerBodyWeight(this.nuevoPeso).subscribe({
      next: () => {
        this.nuevoPeso = null;
        this.cargar();
      },
      error: () => (this.error = 'Ingresa un peso válido (20 a 500 kg).')
    });
  }

  private cargar(): void {
    this.api.getBodyWeights().subscribe(pesos => {
      this.data = pesos.length
        ? [{ name: 'Peso', series: pesos.map(p => ({ name: p.recordedOn, value: p.weightKg })) }]
        : [];
    });
  }

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
