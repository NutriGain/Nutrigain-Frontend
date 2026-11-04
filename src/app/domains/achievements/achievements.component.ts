import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BottomNavbarComponent } from '../../shared/components/bottom-navbar/bottom-navbar.component';
import { ApiService } from '../../core/api.service';
import { Badge } from '../../core/models';

@Component({
  selector: 'app-achievements',
  standalone: true,
  imports: [CommonModule, BottomNavbarComponent],
  template: `
    <div class="page">
      <h2 class="title">Mis logros 🏅</h2>
      <p class="summary" *ngIf="badges.length">{{ unlocked }} de {{ badges.length }} insignias desbloqueadas</p>
      <div class="grid">
        <div class="badge" *ngFor="let b of badges" [class.locked]="!b.unlocked">
          <div class="icon">{{ b.unlocked ? '🏅' : '🔒' }}</div>
          <h3>{{ b.title }}</h3>
          <p>{{ b.description }}</p>
          <small *ngIf="b.unlocked">Desbloqueada el {{ b.awardedOn }}</small>
        </div>
      </div>
      <app-bottom-navbar></app-bottom-navbar>
    </div>
  `,
  styles: [`
    .page { min-height: 100vh; padding: 1.5rem 1.5rem 6rem; background: #f4e9e6; box-sizing: border-box; }
    .title { text-align: center; font-size: 28px; font-weight: bold; color: #212529; }
    .summary { text-align: center; color: #555; }
    .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 16px; max-width: 900px; margin: 0 auto; }
    .badge { background: #fff; border-radius: 12px; padding: 16px; text-align: center; box-shadow: 0 2px 8px rgba(0,0,0,.1); }
    .badge.locked { opacity: .55; }
    .icon { font-size: 40px; }
    h3 { margin: 8px 0 4px; color: #4caf50; }
    p { margin: 0 0 8px; color: #444; }
  `]
})
export class AchievementsComponent implements OnInit {
  badges: Badge[] = [];

  constructor(private api: ApiService) {}

  get unlocked(): number {
    return this.badges.filter(b => b.unlocked).length;
  }

  ngOnInit(): void {
    this.api.getBadges().subscribe(badges => (this.badges = badges));
  }
}
