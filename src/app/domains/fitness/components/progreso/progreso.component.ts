import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { ApiService } from '../../../../core/api.service';

@Component({
  selector: 'app-progreso',
  standalone: true,
  imports: [CommonModule, NgxChartsModule],
  templateUrl: './progreso.component.html',
  styleUrls: ['./progreso.component.css']
})
export class ProgresoComponent implements OnInit {
  data: { name: string; value: number }[] = [];
  view: [number, number] = [700, 400];
  colorScheme: any = {
    domain: ['#5AA454', '#A10A28', '#C7B42C']
  };

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.api.getProgressHistory().subscribe(progresos => {
      this.data = progresos.map((p, i) => ({
        name: `Semana ${i + 1}`,
        value: p.completionPercentage
      }));
    });
  }
}
