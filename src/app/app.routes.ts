import { Routes } from '@angular/router';
import { authGuard } from './core/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  {
    path: 'login',
    title: 'Iniciar sesión | NutriGain',
    loadComponent: () => import('./domains/user/components/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'register',
    title: 'Crear cuenta | NutriGain',
    loadComponent: () => import('./domains/user/components/register/register.component').then(m => m.RegisterComponent)
  },
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () => import('./shared/layout/shell.component').then(m => m.ShellComponent),
    children: [
      {
        path: 'dashboard',
        title: 'Inicio | NutriGain',
        loadComponent: () => import('./domains/user/components/dashboard/dashboard.component').then(m => m.DashboardComponent)
      },
      {
        path: 'rutinas',
        title: 'Rutinas | NutriGain',
        loadComponent: () => import('./domains/fitness/components/rutinas/rutinas.component').then(m => m.RutinasComponent)
      },
      {
        path: 'nutricion',
        title: 'Nutrición | NutriGain',
        loadComponent: () => import('./domains/nutrition/nutrition.component').then(m => m.NutritionComponent)
      },
      {
        path: 'nutricion/comida/:id',
        title: 'Comida | NutriGain',
        loadComponent: () => import('./domains/nutrition/meal-detail.component').then(m => m.MealDetailComponent)
      },
      {
        path: 'retos',
        title: 'Retos | NutriGain',
        loadComponent: () => import('./domains/gamification/components/retos/retos.component').then(m => m.RetosComponent)
      },
      {
        path: 'progreso',
        title: 'Progreso | NutriGain',
        loadComponent: () => import('./domains/fitness/components/progreso/progreso.component').then(m => m.ProgresoComponent)
      },
      {
        path: 'ranking',
        title: 'Ranking | NutriGain',
        loadComponent: () => import('./domains/social/ranking.component').then(m => m.RankingComponent)
      },
      {
        path: 'logros',
        title: 'Logros | NutriGain',
        loadComponent: () => import('./domains/achievements/achievements.component').then(m => m.AchievementsComponent)
      },
      {
        path: 'perfil',
        title: 'Perfil | NutriGain',
        loadComponent: () => import('./domains/profile/profile.component').then(m => m.ProfileComponent)
      }
    ]
  },
  // Old routes kept as redirects so existing links keep working.
  { path: 'nutricionAutomatic', redirectTo: 'nutricion', pathMatch: 'full' },
  { path: 'manual', redirectTo: 'nutricion', pathMatch: 'full' },
  { path: 'avatar', redirectTo: 'perfil', pathMatch: 'full' },
  { path: 'resumen', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: '**', redirectTo: 'dashboard' }
];
