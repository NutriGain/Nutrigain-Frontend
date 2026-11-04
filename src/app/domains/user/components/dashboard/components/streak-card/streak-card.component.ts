import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { ApiService } from '../../../../../../core/api.service';

@Component({
  selector: 'app-streak-card',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule],
  templateUrl: './streak-card.component.html',
  styleUrls: ['./streak-card.component.css']
})
export class StreakCardComponent implements OnInit {
  racha = 0;

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.api.getStreak().subscribe(streak => (this.racha = streak.currentDays));
  }
}
