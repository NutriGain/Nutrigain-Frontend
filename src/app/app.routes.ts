import { Routes } from '@angular/router';
import { ManualPlanComponent } from './domains/manual-plan/manual-plan.component';
import { MealDetailComponent } from './domains/meal-detail/meal-detail.component';
import { NutricionComponent } from './domains/nutrition/components/nutricion/nutricion.component';
import { authGuard } from './core/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  {
    path: 'login',
    loadComponent: () =>
      import('./domains/user/components/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./domains/user/components/register/register.component').then(m => m.RegisterComponent)
  },
  { path: 'nutricionAutomatic', component: NutricionComponent, canActivate: [authGuard] },
  { path: 'manual', component: ManualPlanComponent, canActivate: [authGuard] },
  { path: 'detail/:id', component: MealDetailComponent, canActivate: [authGuard] },
  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./domains/user/components/dashboard/dashboard.component').then(m => m.DashboardComponent)
  },
  {
    path: 'rutinas',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./domains/fitness/components/rutinas/rutinas.component').then(m => m.RutinasComponent)
  },
  {
    path: 'nutricion',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./domains/home/home.component').then(m => m.HomeComponent)
  },
  {
    path: 'progreso',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./domains/fitness/components/progreso/progreso.component').then(m => m.ProgresoComponent)
  },
  {
    path: 'avatar',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./domains/gamification/components/avatar/avatar.component').then(m => m.AvatarComponent)
  },
  {
    path: 'retos',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./domains/gamification/components/retos/retos.component').then(m => m.RetosComponent)
  },
  {
    path: 'resumen',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./domains/user/components/resumen/resumen.component').then(m => m.ResumenComponent)
  },
  {
    path: 'perfil',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./domains/profile/profile.component').then(m => m.ProfileComponent)
  },
  {
    path: 'logros',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./domains/achievements/achievements.component').then(m => m.AchievementsComponent)
  },
  {
    path: 'ranking',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./domains/social/ranking.component').then(m => m.RankingComponent)
  },
  { path: '**', redirectTo: 'dashboard' }
];
