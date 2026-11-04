import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatButtonModule } from '@angular/material/button';
import { MatBadgeModule } from '@angular/material/badge';
import { MatDividerModule } from '@angular/material/divider';
import { MatMenu, MatMenuItem, MatMenuTrigger } from '@angular/material/menu';

import { AvatarCardComponent } from './components/avatar-card/avatar-card.component';
import { RetoCardComponent } from './components/reto-card/reto-card.component';
import { FraseCardComponent } from './components/frase-card/frase-card.component';
import { ProgresoCardComponent } from './components/progreso-card/progreso-card.component';
import { StreakCardComponent } from './components/streak-card/streak-card.component';
import { BodyweightCardComponent } from './components/bodyweight-card/bodyweight-card.component';
import { BottomNavbarComponent } from '../../../../shared/components/bottom-navbar/bottom-navbar.component';
import { ApiService } from '../../../../core/api.service';
import { AuthService } from '../../../../core/auth.service';
import { AppNotification } from '../../../../core/models';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatProgressBarModule,
    MatButtonModule,
    MatBadgeModule,
    MatDividerModule,
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
export class DashboardComponent implements OnInit {
  notificaciones: AppNotification[] = [];
  sinLeer = 0;

  constructor(private router: Router, private api: ApiService, private auth: AuthService) {}

  ngOnInit(): void {
    this.cargarNotificaciones();
  }

  cargarNotificaciones(): void {
    this.api.getNotifications().subscribe(items => {
      this.notificaciones = items.slice(0, 5);
      this.sinLeer = items.filter(n => !n.seen).length;
    });
  }

  marcarTodasComoLeidas(): void {
    this.api.markAllNotificationsSeen().subscribe(() => {
      this.sinLeer = 0;
      this.notificaciones = this.notificaciones.map(n => ({ ...n, seen: true }));
    });
  }

  navigateTo(route: string) {
    this.router.navigate([route]);
  }

  logout() {
    this.auth.logout();
  }
}
