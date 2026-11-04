import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BottomNavbarComponent } from '../../shared/components/bottom-navbar/bottom-navbar.component';
import { ApiService } from '../../core/api.service';
import { Competitor } from '../../core/models';

type Tab = 'friends' | 'global';

@Component({
  selector: 'app-ranking',
  standalone: true,
  imports: [CommonModule, FormsModule, BottomNavbarComponent],
  template: `
    <div class="page">
      <h2 class="title">Ranking 🏆</h2>

      <div class="tabs">
        <button [class.active]="tab === 'friends'" (click)="select('friends')">Amigos</button>
        <button [class.active]="tab === 'global'" (click)="select('global')">Global</button>
      </div>

      <ul class="list">
        <li *ngFor="let c of rows" [class.me]="c.me">
          <span class="rank">{{ c.rank }}</span>
          <span class="name">{{ c.displayName }} <small>Nivel {{ c.level }} · racha {{ c.currentStreak }}</small></span>
          <span class="xp">{{ c.experience }} XP</span>
          <button *ngIf="!c.me" (click)="toggleFollow(c)">{{ c.following ? 'Dejar de seguir' : 'Seguir' }}</button>
        </li>
      </ul>
      <p class="empty" *ngIf="rows.length <= 1 && tab === 'friends'">Sigue a otros usuarios para competir con tus amigos.</p>

      <h3>Buscar usuarios</h3>
      <form class="search" (ngSubmit)="search()">
        <input name="q" [(ngModel)]="query" placeholder="Nombre (mínimo 2 letras)" />
        <button type="submit" [disabled]="query.trim().length < 2">Buscar</button>
      </form>
      <ul class="list" *ngIf="results.length">
        <li *ngFor="let c of results">
          <span class="name">{{ c.displayName }} <small>Nivel {{ c.level }}</small></span>
          <button *ngIf="!c.me" (click)="toggleFollow(c)">{{ c.following ? 'Dejar de seguir' : 'Seguir' }}</button>
        </li>
      </ul>
      <app-bottom-navbar></app-bottom-navbar>
    </div>
  `,
  styles: [`
    .page { min-height: 100vh; padding: 1.5rem 1.5rem 6rem; background: #f4e9e6; box-sizing: border-box; max-width: 700px; margin: 0 auto; }
    .title { text-align: center; font-size: 28px; font-weight: bold; color: #212529; }
    .tabs { display: flex; gap: 8px; justify-content: center; margin-bottom: 12px; }
    .tabs button { padding: 8px 20px; border: none; border-radius: 20px; background: #fff; cursor: pointer; }
    .tabs button.active { background: #4caf50; color: #fff; }
    .list { list-style: none; padding: 0; margin: 0 0 16px; }
    li { display: flex; align-items: center; gap: 12px; background: #fff; border-radius: 10px; padding: 10px 14px; margin-bottom: 8px; box-shadow: 0 2px 6px rgba(0,0,0,.08); }
    li.me { outline: 2px solid #4caf50; }
    .rank { font-weight: bold; width: 24px; color: #4caf50; }
    .name { flex: 1; }
    small { color: #777; margin-left: 6px; }
    .xp { font-weight: 600; }
    button { cursor: pointer; }
    li button { border: 1px solid #4caf50; background: #fff; color: #4caf50; border-radius: 14px; padding: 4px 12px; }
    .search { display: flex; gap: 8px; margin-bottom: 12px; }
    .search input { flex: 1; padding: 8px 12px; border-radius: 8px; border: 1px solid #ccc; }
    .empty { color: #666; text-align: center; }
  `]
})
export class RankingComponent implements OnInit {
  tab: Tab = 'friends';
  rows: Competitor[] = [];
  results: Competitor[] = [];
  query = '';

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.select('friends');
  }

  select(tab: Tab): void {
    this.tab = tab;
    const source = tab === 'friends' ? this.api.getFriendsLeaderboard() : this.api.getGlobalLeaderboard();
    source.subscribe(rows => (this.rows = rows));
  }

  search(): void {
    this.api.searchUsers(this.query.trim()).subscribe(results => (this.results = results));
  }

  toggleFollow(c: Competitor): void {
    const call = c.following ? this.api.unfollow(c.userId) : this.api.follow(c.userId);
    call.subscribe(() => {
      this.select(this.tab);
      if (this.results.length) {
        this.search();
      }
    });
  }
}
