import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Observable, catchError, forkJoin, of } from 'rxjs';
import { ApiService } from '../../core/api.service';
import { ToastService } from '../../core/toast.service';
import { DayOfWeek, Macros, ManualPlan, Meal, MealType, NutritionPlan, PlannedMeal } from '../../core/models';
import { DAY_SHORT, WEEK_DAYS, todayDayOfWeek } from '../../core/format';
import { MEAL_TYPES, dayEs, mealTypeEs, mealTypeIcon } from '../../core/i18n';

type Tab = 'plan' | 'explore';

const FOCUS: Record<string, string> = {
  HIGH_PROTEIN: 'Alta en proteína',
  HIGH_CARB: 'Alta en carbohidratos',
  LIGHT: 'Ligera y balanceada'
};

const ZERO: Macros = { calories: 0, proteins: 0, carbohydrates: 0, fats: 0 };

@Component({
  selector: 'app-nutrition',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="page">
      <div class="page-head">
        <div>
          <h1 class="page-title">Nutrición</h1>
          <p class="page-sub" *ngIf="plan">Tu plan semanal: <strong>{{ focus }}</strong></p>
        </div>
        <div class="tabs" role="tablist">
          <button type="button" role="tab" [class.active]="tab === 'plan'" (click)="setTab('plan')">Plan semanal</button>
          <button type="button" role="tab" [class.active]="tab === 'explore'" (click)="setTab('explore')">Mis comidas</button>
        </div>
      </div>

      <div class="skeleton" style="height: 320px" *ngIf="loading"></div>

      <!-- Automatic weekly plan -->
      <ng-container *ngIf="!loading && tab === 'plan'">
        <div class="empty card" *ngIf="!plan"><span class="material-icons">restaurant</span><p>Aún no tienes un plan automático.</p></div>
        <ng-container *ngIf="plan">
          <div class="chips days" role="tablist">
            <button type="button" class="chip" *ngFor="let d of days" [class.active]="selectedDay === d" (click)="selectedDay = d">
              {{ short(d) }}<span class="today-dot" *ngIf="d === today"></span>
            </button>
          </div>

          <h2 class="section-title">{{ dayName(selectedDay) }}</h2>
          <div class="grid cols-4 totals">
            <div class="card stat"><div class="stat-top">Calorías</div><div class="stat-value">{{ dayTotals.calories }}<small>kcal</small></div></div>
            <div class="card stat"><div class="stat-top"><span class="dot p"></span>Proteína</div><div class="stat-value">{{ dayTotals.proteins }}<small>g</small></div></div>
            <div class="card stat"><div class="stat-top"><span class="dot c"></span>Carbohidratos</div><div class="stat-value">{{ dayTotals.carbohydrates }}<small>g</small></div></div>
            <div class="card stat"><div class="stat-top"><span class="dot f"></span>Grasas</div><div class="stat-value">{{ dayTotals.fats }}<small>g</small></div></div>
          </div>

          <div class="grid cols-2 meals">
            <article class="meal card fade-in" *ngFor="let item of dayMeals">
              <a class="photo" [routerLink]="['/nutricion/comida', item.meal.id]" [attr.data-icon]="icon(item.mealType)">
                <img [src]="item.meal.imageUrl" [alt]="item.meal.name" loading="lazy" (error)="hideImage($event)">
                <span class="pill type">{{ type(item.mealType) }}</span>
              </a>
              <div class="body">
                <a class="name" [routerLink]="['/nutricion/comida', item.meal.id]">{{ item.meal.name }}</a>
                <div class="macros">
                  <span class="pill pill-orange">{{ item.meal.calories }} kcal</span>
                  <span class="pill pill-green">P {{ item.meal.proteins }}g</span>
                  <span class="pill pill-blue">C {{ item.meal.carbohydrates }}g</span>
                  <span class="pill pill-violet">G {{ item.meal.fats }}g</span>
                </div>
              </div>
            </article>
          </div>
          <div class="empty card" *ngIf="dayMeals.length === 0"><span class="material-icons">no_meals</span><p>No hay comidas planificadas para este día.</p></div>
        </ng-container>
      </ng-container>

      <!-- Manual plan -->
      <ng-container *ngIf="!loading && tab === 'explore'">
        <div class="grid split">
          <section>
            <div class="chips filters">
              <button type="button" class="chip" [class.active]="selectedType === 'ALL'" (click)="selectedType = 'ALL'">Todas</button>
              <button type="button" class="chip" *ngFor="let t of types" [class.active]="selectedType === t.code" (click)="selectedType = t.code">
                {{ t.icon }} {{ t.label }}
              </button>
            </div>
            <div class="grid cols-2 meals">
              <article class="meal card fade-in" *ngFor="let m of filtered">
                <a class="photo" [routerLink]="['/nutricion/comida', m.id]" [attr.data-icon]="icon(m.mealType)">
                  <img [src]="m.imageUrl" [alt]="m.name" loading="lazy" (error)="hideImage($event)">
                  <span class="pill type">{{ type(m.mealType) }}</span>
                </a>
                <div class="body">
                  <a class="name" [routerLink]="['/nutricion/comida', m.id]">{{ m.name }}</a>
                  <div class="macros">
                    <span class="pill pill-orange">{{ m.calories }} kcal</span>
                    <span class="pill pill-green">P {{ m.proteins }}g</span>
                  </div>
                  <button type="button" class="btn btn-sm" [ngClass]="isAdded(m.id) ? 'btn-danger-ghost' : 'btn-primary'"
                          [disabled]="busyId === m.id" (click)="toggle(m)">
                    <span class="material-icons">{{ isAdded(m.id) ? 'remove' : 'add' }}</span>{{ isAdded(m.id) ? 'Quitar' : 'Agregar' }}
                  </button>
                </div>
              </article>
            </div>
          </section>

          <aside class="card card-pad summary">
            <div class="card-head"><h3 class="card-title"><span class="material-icons">playlist_add_check</span>Mi plan manual</h3><span class="pill pill-gray">{{ manual.meals.length }}</span></div>
            <ng-container *ngIf="manual.meals.length; else emptyManual">
              <div class="big">{{ manual.totals.calories }}<small>kcal</small></div>
              <div class="split-bar" aria-hidden="true">
                <span class="p" [style.flex]="share.p"></span><span class="c" [style.flex]="share.c"></span><span class="f" [style.flex]="share.f"></span>
              </div>
              <div class="legend">
                <span><i class="dot p"></i>Proteína {{ manual.totals.proteins }}g</span>
                <span><i class="dot c"></i>Carbos {{ manual.totals.carbohydrates }}g</span>
                <span><i class="dot f"></i>Grasas {{ manual.totals.fats }}g</span>
              </div>
              <ul>
                <li *ngFor="let m of manual.meals">
                  <a [routerLink]="['/nutricion/comida', m.id]"><strong>{{ m.name }}</strong><small>{{ m.calories }} kcal · {{ type(m.mealType) }}</small></a>
                  <button type="button" class="icon-btn" aria-label="Quitar" (click)="toggle(m)"><span class="material-icons">close</span></button>
                </li>
              </ul>
            </ng-container>
            <ng-template #emptyManual>
              <div class="empty"><span class="material-icons">restaurant_menu</span><p>Agrega comidas para armar tu propio plan y ver el total de calorías y macros.</p></div>
            </ng-template>
          </aside>
        </div>
      </ng-container>
    </div>
  `,
  styles: [`
    .days { margin-bottom: 4px; }
    .days .chip { position: relative; min-width: 56px; }
    .today-dot { position: absolute; top: 4px; right: 6px; width: 6px; height: 6px; border-radius: 50%; background: var(--accent); }
    .dot { display: inline-block; width: 9px; height: 9px; border-radius: 50%; margin-right: 6px; }
    .dot.p, .split-bar .p { background: var(--brand); }
    .dot.c, .split-bar .c { background: var(--info); }
    .dot.f, .split-bar .f { background: var(--violet); }
    .totals { margin-bottom: 16px; }
    .totals .stat { padding: 14px 16px; }
    .totals .stat-value { font-size: 24px; }
    .meals { margin-top: 16px; }
    .filters { margin-bottom: 4px; }
    .meal { overflow: hidden; display: flex; flex-direction: column; transition: box-shadow .2s, transform .2s; }
    .meal:hover { box-shadow: var(--shadow-lg); transform: translateY(-2px); }
    .photo { position: relative; display: block; height: 150px; background: linear-gradient(135deg, var(--brand-100), var(--brand-50)); }
    .photo::before { content: attr(data-icon); position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; font-size: 44px; }
    .photo img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
    .type { position: absolute; left: 10px; top: 10px; background: rgba(255, 255, 255, .95); color: var(--text); box-shadow: 0 2px 6px rgba(0, 0, 0, .12); }
    .body { padding: 14px 16px 16px; display: flex; flex-direction: column; gap: 10px; flex: 1; }
    .name { font-weight: 700; font-size: 15.5px; }
    .name:hover { color: var(--brand-700); }
    .macros { display: flex; gap: 6px; flex-wrap: wrap; }
    .body .btn { align-self: flex-start; margin-top: auto; }
    .summary { position: sticky; top: calc(var(--topbar-h) + 16px); align-self: start; }
    .big { font-size: 34px; font-weight: 800; letter-spacing: -.02em; }
    .big small { font-size: 14px; color: var(--muted); font-weight: 600; margin-left: 4px; }
    .split-bar { display: flex; height: 10px; border-radius: 999px; overflow: hidden; margin: 12px 0 10px; background: #edf1f5; gap: 2px; }
    .legend { display: flex; flex-wrap: wrap; gap: 4px 14px; font-size: 12.5px; color: var(--muted); margin-bottom: 14px; }
    .summary ul { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 8px; }
    .summary li { display: flex; align-items: center; justify-content: space-between; gap: 8px; padding: 8px 10px; background: var(--surface-2); border-radius: 12px; }
    .summary li a { display: flex; flex-direction: column; min-width: 0; }
    .summary li strong { font-size: 14px; }
    .summary li small { color: var(--muted); font-size: 12px; }
    .summary .icon-btn { width: 32px; height: 32px; }
    .summary .icon-btn .material-icons { font-size: 18px; }
    @media (max-width: 980px) { .summary { position: static; } }
  `]
})
export class NutritionComponent implements OnInit {
  tab: Tab = 'plan';
  loading = true;
  plan: NutritionPlan | null = null;
  meals: Meal[] = [];
  manual: ManualPlan = { meals: [], totals: ZERO };
  selectedDay: DayOfWeek = todayDayOfWeek();
  selectedType: MealType | 'ALL' = 'ALL';
  busyId: number | null = null;

  readonly days = WEEK_DAYS;
  readonly types = MEAL_TYPES;
  readonly today = todayDayOfWeek();
  readonly short = (d: DayOfWeek) => DAY_SHORT[d];
  readonly dayName = dayEs;
  readonly type = mealTypeEs;
  readonly icon = mealTypeIcon;

  constructor(private api: ApiService, private route: ActivatedRoute, private router: Router, private toast: ToastService) {}

  ngOnInit(): void {
    this.tab = this.route.snapshot.queryParamMap.get('tab') === 'explore' ? 'explore' : 'plan';
    forkJoin({
      plan: this.safe(this.api.getNutritionPlan()),
      meals: this.safe(this.api.getMeals()),
      manual: this.safe(this.api.getManualPlan())
    }).subscribe(r => {
      this.plan = r.plan;
      this.meals = r.meals ?? [];
      this.manual = r.manual ?? { meals: [], totals: ZERO };
      if (this.plan && !this.plan.days.some(d => d.dayOfWeek === this.selectedDay)) {
        this.selectedDay = this.plan.days[0]?.dayOfWeek ?? this.selectedDay;
      }
      this.loading = false;
    });
  }

  private safe<T>(source: Observable<T>): Observable<T | null> {
    return source.pipe(catchError(() => of(null)));
  }

  setTab(tab: Tab): void {
    this.tab = tab;
    this.router.navigate([], { queryParams: { tab: tab === 'explore' ? 'explore' : null }, replaceUrl: true });
  }

  get focus(): string {
    return this.plan ? FOCUS[this.plan.focus] ?? this.plan.focus : '';
  }

  get dayMeals(): PlannedMeal[] {
    return this.plan?.days.find(d => d.dayOfWeek === this.selectedDay)?.meals ?? [];
  }

  get dayTotals(): Macros {
    return this.dayMeals.reduce<Macros>((t, i) => ({
      calories: t.calories + i.meal.calories,
      proteins: t.proteins + i.meal.proteins,
      carbohydrates: t.carbohydrates + i.meal.carbohydrates,
      fats: t.fats + i.meal.fats
    }), ZERO);
  }

  get filtered(): Meal[] {
    return this.selectedType === 'ALL' ? this.meals : this.meals.filter(m => m.mealType === this.selectedType);
  }

  get share(): { p: number; c: number; f: number } {
    const t = this.manual.totals;
    return { p: Math.max(t.proteins, 0.01), c: Math.max(t.carbohydrates, 0.01), f: Math.max(t.fats, 0.01) };
  }

  isAdded(id: number): boolean {
    return this.manual.meals.some(m => m.id === id);
  }

  toggle(meal: Meal): void {
    this.busyId = meal.id;
    const call = this.isAdded(meal.id) ? this.api.removeManualMeal(meal.id) : this.api.addManualMeal(meal.id);
    const adding = !this.isAdded(meal.id);
    call.subscribe({
      next: plan => {
        this.manual = plan;
        this.busyId = null;
        this.toast.success(adding ? `${meal.name} agregada a tu plan` : `${meal.name} quitada de tu plan`);
      },
      error: () => {
        this.busyId = null;
        this.toast.error('No se pudo actualizar tu plan.');
      }
    });
  }

  hideImage(event: Event): void {
    (event.target as HTMLImageElement).style.display = 'none';
  }
}
