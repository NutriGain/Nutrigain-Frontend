import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { ApiService } from '../../../../../../core/api.service';

@Component({
  selector: 'app-progreso-card',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatProgressBarModule],
  templateUrl: './progreso-card.component.html',
  styleUrls: ['./progreso-card.component.css']
})
export class ProgresoCardComponent implements OnInit {
  progreso = 0;

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.api.getCurrentProgress().subscribe(p => (this.progreso = p.completionPercentage));
  }
}
