import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import {BottomNavbarComponent} from '../../../../shared/components/bottom-navbar/bottom-navbar.component';
import {environment} from '../../../../../environments/environment';

@Component({
  selector: 'app-rutinas',
  standalone: true,
  imports: [CommonModule, BottomNavbarComponent],
  templateUrl: './rutinas.component.html',
  styleUrls: ['./rutinas.component.css']
})
export class RutinasComponent implements OnInit {
  rutinas: any[] = [];

  private readonly base = environment.apiUrl;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    const userId = 1; // Temporal: simula al usuario logueado
    this.http.get<any[]>(`${this.base}/rutinas?userId=${userId}`).subscribe(data => {
      this.rutinas = data;
    });
  }
}
