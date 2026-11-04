import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { ApiService } from '../../../../../../core/api.service';
import { ChallengeAssignment } from '../../../../../../core/models';

/** The extreme challenge of the day: the same one all day, and it can be completed once. */
@Component({
  selector: 'app-reto-card',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule],
  templateUrl: './reto-card.component.html',
  styleUrls: ['./reto-card.component.css']
})
export class RetoCardComponent implements OnInit {
  asignacion?: ChallengeAssignment;

  constructor(private api: ApiService) {}

  get completado(): boolean {
    return this.asignacion?.status === 'COMPLETED';
  }

  ngOnInit(): void {
    this.api.requestDailyExtreme().subscribe(a => (this.asignacion = a));
  }

  completar(): void {
    if (!this.asignacion || this.completado) {
      return;
    }
    this.api.completeChallenge(this.asignacion.id).subscribe(a => (this.asignacion = a));
  }
}
