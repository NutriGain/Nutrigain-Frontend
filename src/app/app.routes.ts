import { Routes } from '@angular/router';
import {ManualPlanComponent} from './domains/manual-plan/manual-plan.component';
import {MealDetailComponent} from './domains/meal-detail/meal-detail.component';
import {NutricionComponent} from './domains/nutrition/components/nutricion/nutricion.component';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
  {
    path: 'nutricionAutomatic', component: NutricionComponent,
  },
  {
    path: 'manual', component: ManualPlanComponent,
  },
  {
   path: 'detail/:id', component: MealDetailComponent
  },
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
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./domains/user/components/dashboard/dashboard.component').then(m => m.DashboardComponent)
  },
  {
    path: 'rutinas',
    loadComponent: () =>
      import('./domains/fitness/components/rutinas/rutinas.component').then(m => m.RutinasComponent)
  },
  {
    path: 'nutricion',
    loadComponent: () =>
      import('./domains/home/home.component').then(m => m.HomeComponent)
  },
  {
    path: 'progreso',
    loadComponent: () =>
      import('./domains/fitness/components/progreso/progreso.component').then(m => m.ProgresoComponent)
  },
  {
    path: 'avatar',
    loadComponent: () =>
      import('./domains/gamification/components/avatar/avatar.component').then(m => m.AvatarComponent)
  },
  {
    path: 'retos',
    loadComponent: () =>
      import('./domains/gamification/components/retos/retos.component').then(m => m.RetosComponent)
  },
  {
    path: 'resumen',
    loadComponent: () =>
      import('./domains/user/components/resumen/resumen.component').then(m => m.ResumenComponent)
  }
];
