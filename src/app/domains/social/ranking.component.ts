import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/api.service';
import { ToastService } from '../../core/toast.service';
import { Competitor } from '../../core/models';
import { initials } from '../../core/format';

type Tab = 'friends' | 'global';

const COLORS = ['#10b981', '#3b82f6', '#8b5cf6', '#f97316', '#ec4899', '#14b8a6', '#eab308'];

@Component({
  selector: 'app-ranking',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page">
      <div class="page-head">
        <div>
          <h1 class="page-title">Ranking</h1>
          <p class="page-sub">Compite por XP con tus amigos y con toda la comunidad</p>
        </div>
        <div class="tabs" role="tablist">
          <button type="button" role="tab" [class.active]="tab === 'friends'" (click)="select('friends')">Amigos</button>
          <button type="button" role="tab" [class.active]="tab === 'global'" (click)="select('global')">Global</button>
        </div>
      </div>

      <div class="grid split">
        <section class="card list">
          <div class="skeleton" style="height: 240px; margin: 16px" *ngIf="loading"></div>
          <ul *ngIf="!loading">
            <li *ngFor="let c of rows" [class.me]="c.me" class="fade-in">
              <span class="rank" [class.gold]="c.rank === 1" [class.silver]="c.rank === 2" [class.bronze]="c.rank === 3">{{ c.rank }}</span>
              <span class="avatar" [style.background]="color(c)">{{ ini(c) }}</span>
              <div class="info">
                <strong>{{ c.displayName }} <span class="pill pill-green" *ngIf="c.me">Tú</span></strong>
                <small>Nivel {{ c.level }} · racha {{ c.currentStreak }} {{ c.currentStreak === 1 ? 'día' : 'días' }}</small>
              </div>
              <span class="xp">{{ c.experience }} XP</span>
              <button type="button" class="btn btn-sm" *ngIf="!c.me" [ngClass]="c.following ? 'btn-ghost' : 'btn-primary'" (click)="toggle(c)">
                {{ c.following ? 'Siguiendo' : 'Seguir' }}
              </button>
            </li>
          </ul>
          <div class="empty" *ngIf="!loading && rows.length <= 1 && tab === 'friends'">
            <span class="material-icons">group_add</span>
            <p>Aún no sigues a nadie. Usa el buscador para encontrar usuarios y competir con amigos.</p>
          </div>
        </section>

        <aside class="card card-pad search">
          <div class="card-head"><h3 class="card-title"><span class="material-icons">person_search</span>Buscar usuarios</h3></div>
          <form (ngSubmit)="search()">
            <input class="input" name="q" [(ngModel)]="query" placeholder="Nombre (mínimo 2 letras)" autocomplete="off">
            <button class="btn btn-primary" type="submit" [disabled]="query.trim().length < 2">Buscar</button>
          </form>
          <ul *ngIf="results.length">
            <li *ngFor="let c of results">
              <span class="avatar" [style.background]="color(c)">{{ ini(c) }}</span>
              <div class="info"><strong>{{ c.displayName }}</strong><small>Nivel {{ c.level }}</small></div>
              <button type="button" class="btn btn-sm" *ngIf="!c.me" [ngClass]="c.following ? 'btn-ghost' : 'btn-primary'" (click)="toggle(c)">
                {{ c.following ? 'Siguiendo' : 'Seguir' }}
              </button>
            </li>
          </ul>
          <p class="muted hint" *ngIf="searched && !results.length">No encontramos usuarios con ese nombre.</p>
        </aside>
      </div>
    </div>
  `,
  styles: [`
    .list { padding: 8px; }
    ul { list-style: none; margin: 0; padding: 0; }
    .list li, .search li { display: flex; align-items: center; gap: 12px; padding: 12px; border-radius: 14px; }
    .list li + li { border-top: 1px solid #f1f4f8; }
    .list li.me { background: var(--brand-50); }
    .rank { width: 30px; height: 30px; border-radius: 10px; display: inline-flex; align-items: center; justify-content: center; font-weight: 800; color: var(--muted); background: var(--surface-2); flex: none; }
    .rank.gold { background: #fef3c7; color: #b45309; }
    .rank.silver { background: #e2e8f0; color: #475569; }
    .rank.bronze { background: #ffedd5; color: #c2410c; }
    .avatar { width: 42px; height: 42px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; color: #fff; font-weight: 700; flex: none; }
    .info { flex: 1; display: flex; flex-direction: column; min-width: 0; }
    .info strong { font-size: 15px; display: flex; align-items: center; gap: 6px; }
    .info small { color: var(--muted); font-size: 12.5px; }
    .xp { font-weight: 800; color: var(--brand-700); white-space: nowrap; }
    .search form { display: flex; gap: 8px; margin-bottom: 8px; }
    .search form .input { flex: 1; }
    .hint { font-size: 14px; margin-top: 8px; }
    @media (max-width: 520px) { .xp { font-size: 13px; } .list li { gap: 8px; padding: 10px 6px; } }
  `]
})
export class RankingComponent implements OnInit {
  tab: Tab = 'friends';
  rows: Competitor[] = [];
  results: Competitor[] = [];
  query = '';
  loading = true;
  searched = false;

  readonly ini = (c: Competitor) => initials(c.displayName);

  constructor(private api: ApiService, private toast: ToastService) {}

  ngOnInit(): void {
    this.select('friends');
  }

  color(c: Competitor): string {
    return COLORS[c.userId % COLORS.length];
  }

  select(tab: Tab): void {
    this.tab = tab;
    this.loading = true;
    const source = tab === 'friends' ? this.api.getFriendsLeaderboard() : this.api.getGlobalLeaderboard();
    source.subscribe({
      next: rows => {
        this.rows = rows;
        this.loading = false;
      },
      error: () => (this.loading = false)
    });
  }

  search(): void {
    this.api.searchUsers(this.query.trim()).subscribe(results => {
      this.results = results;
      this.searched = true;
    });
  }

  toggle(c: Competitor): void {
    const following = c.following;
    const call = following ? this.api.unfollow(c.userId) : this.api.follow(c.userId);
    call.subscribe({
      next: () => {
        this.toast.success(following ? `Dejaste de seguir a ${c.displayName}` : `Ahora sigues a ${c.displayName}`);
        this.select(this.tab);
        if (this.searched) {
          this.search();
        }
      },
      error: () => this.toast.error('No se pudo actualizar.')
    });
  }
}
