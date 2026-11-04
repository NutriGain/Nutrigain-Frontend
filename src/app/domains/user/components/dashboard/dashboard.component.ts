import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {Router, RouterLink} from '@angular/router';

import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatButtonModule } from '@angular/material/button';

import { AvatarCardComponent } from './components/avatar-card/avatar-card.component';
import { RetoCardComponent } from './components/reto-card/reto-card.component';
import { FraseCardComponent } from './components/frase-card/frase-card.component';
import { ProgresoCardComponent } from './components/progreso-card/progreso-card.component';
import { StreakCardComponent } from './components/streak-card/streak-card.component';
import { BodyweightCardComponent } from './components/bodyweight-card/bodyweight-card.component';
import {MatMenu, MatMenuItem, MatMenuTrigger} from '@angular/material/menu';
import {BottomNavbarComponent} from '../../../../shared/components/bottom-navbar/bottom-navbar.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
  imports: [
    CommonModule,
    RouterLink,
    MatCardModule,
    MatIconModule,
    MatProgressBarModule,
    MatButtonModule,
    AvatarCardComponent,
    RetoCardComponent,
    FraseCardComponent,
    ProgresoCardComponent,
    StreakCardComponent,
    BodyweightCardComponent,
    MatMenu,
    MatMenuTrigger,
    MatMenuItem,
    BottomNavbarComponent
  ]
})
export class DashboardComponent {
  constructor(private router: Router) {}

  navigateTo(route: string) {
    this.router.navigate([route]);
  }

  logout() {
    // Aquí podrías limpiar el almacenamiento si usas tokens:
    // localStorage.clear();
    this.router.navigate(['/login']);
  }
}
