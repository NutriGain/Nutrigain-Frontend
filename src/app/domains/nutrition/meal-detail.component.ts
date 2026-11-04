import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { forkJoin, of, catchError } from 'rxjs';
import { ApiService } from '../../core/api.service';
import { ToastService } from '../../core/toast.service';
import { ManualPlan, Meal } from '../../core/models';
import { mealTypeEs, mealTypeIcon } from '../../core/i18n';

@Component({
  selector: 'app-meal-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="page narrow">
      <a class="back" routerLink="/nutricion"><span class="material-icons">arrow_back</span>Volver a nutrición</a>

      <div class="skeleton" style="height: 380px" *ngIf="loading"></div>

      <div class="empty card" *ngIf="!loading && !meal">
        <span class="material-icons">search_off</span><p>No encontramos esta comida.</p>
      </div>

      <article class="card fade-in" *ngIf="meal as m">
        <div class="photo" [attr.data-icon]="icon(m)">
          <img [src]="m.imageUrl" [alt]="m.name" (error)="hideImage($event)">
        </div>
        <div class="content">
          <span class="pill pill-green">{{ type(m) }}</span>
          <h1>{{ m.name }}</h1>

          <div class="kcal"><strong>{{ m.calories }}</strong><span>kcal por porción</span></div>

          <div class="macros">
            <div class="macro">
              <div class="row"><span><i class="dot p"></i>Proteína</span><strong>{{ m.proteins }} g</strong></div>
              <div class="progress"><span class="bar p" [style.width.%]="pct(m.proteins)"></span></div>
            </div>
            <div class="macro">
              <div class="row"><span><i class="dot c"></i>Carbohidratos</span><strong>{{ m.carbohydrates }} g</strong></div>
              <div class="progress"><span class="bar c" [style.width.%]="pct(m.carbohydrates)"></span></div>
            </div>
            <div class="macro">
              <div class="row"><span><i class="dot f"></i>Grasas</span><strong>{{ m.fats }} g</strong></div>
              <div class="progress"><span class="bar f" [style.width.%]="pct(m.fats)"></span></div>
            </div>
          </div>

          <button type="button" class="btn" [ngClass]="added ? 'btn-danger-ghost' : 'btn-primary'" [disabled]="busy" (click)="toggle(m)">
            <span class="material-icons">{{ added ? 'remove' : 'add' }}</span>{{ added ? 'Quitar de mi plan' : 'Agregar a mi plan' }}
          </button>
        </div>
      </article>
    </div>
  `,
  styles: [`
    .narrow { max-width: 760px; }
    .back { display: inline-flex; align-items: center; gap: 6px; color: var(--muted); font-weight: 600; margin-bottom: 16px; }
    .back:hover { color: var(--text); }
    article { overflow: hidden; }
    .photo { position: relative; height: 280px; background: linear-gradient(135deg, var(--brand-100), var(--brand-50)); }
    .photo::before { content: attr(data-icon); position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; font-size: 72px; }
    .photo img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
    .content { padding: 24px; display: flex; flex-direction: column; gap: 16px; align-items: flex-start; }
    h1 { font-size: 28px; font-weight: 800; }
    .kcal { display: flex; align-items: baseline; gap: 10px; }
    .kcal strong { font-size: 40px; letter-spacing: -.02em; }
    .kcal span { color: var(--muted); }
    .macros { width: 100%; display: flex; flex-direction: column; gap: 14px; }
    .row { display: flex; justify-content: space-between; margin-bottom: 6px; font-size: 14px; }
    .dot { display: inline-block; width: 9px; height: 9px; border-radius: 50%; margin-right: 8px; }
    .dot.p, .bar.p { background: var(--brand); }
    .dot.c, .bar.c { background: var(--info); }
    .dot.f, .bar.f { background: var(--violet); }
    .bar { background-image: none !important; }
  `]
})
export class MealDetailComponent implements OnInit {
  meal: Meal | null = null;
  manual: ManualPlan | null = null;
  loading = true;
  busy = false;

  readonly type = (m: Meal) => mealTypeEs(m.mealType);
  readonly icon = (m: Meal) => mealTypeIcon(m.mealType);

  constructor(private route: ActivatedRoute, private router: Router, private api: ApiService, private toast: ToastService) {}

  get added(): boolean {
    return !!this.meal && !!this.manual && this.manual.meals.some(x => x.id === this.meal?.id);
  }

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    forkJoin({
      meal: this.api.getMeal(id).pipe(catchError(() => of(null))),
      manual: this.api.getManualPlan().pipe(catchError(() => of(null)))
    }).subscribe(r => {
      this.meal = r.meal;
      this.manual = r.manual;
      this.loading = false;
    });
  }

  /** Bars are relative to a typical daily reference so they read at a glance. */
  pct(grams: number): number {
    return Math.min(100, Math.round((grams / 80) * 100));
  }

  toggle(meal: Meal): void {
    this.busy = true;
    const adding = !this.added;
    const call = adding ? this.api.addManualMeal(meal.id) : this.api.removeManualMeal(meal.id);
    call.subscribe({
      next: plan => {
        this.manual = plan;
        this.busy = false;
        this.toast.success(adding ? 'Agregada a tu plan' : 'Quitada de tu plan');
      },
      error: () => {
        this.busy = false;
        this.toast.error('No se pudo actualizar tu plan.');
      }
    });
  }

  hideImage(event: Event): void {
    (event.target as HTMLImageElement).style.display = 'none';
  }
}
