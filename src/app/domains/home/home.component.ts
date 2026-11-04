import { Component } from '@angular/core';
import { Router } from '@angular/router';
import {CommonModule} from '@angular/common';
import {BottomNavbarComponent} from '../../shared/components/bottom-navbar/bottom-navbar.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, BottomNavbarComponent],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {
  constructor(private router: Router) {}

  goToManual() {
    this.router.navigate(['/manual']);
  }

  autoPlan() {
    this.router.navigate(['/nutricionAutomatic']);
  }
}
