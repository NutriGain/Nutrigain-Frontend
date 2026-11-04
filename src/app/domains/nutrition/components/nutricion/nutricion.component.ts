import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import {BottomNavbarComponent} from '../../../../shared/components/bottom-navbar/bottom-navbar.component';
import {environment} from '../../../../../environments/environment';

@Component({
  selector: 'app-nutricion',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './nutricion.component.html',
  styleUrls: ['./nutricion.component.css']
})
export class NutricionComponent implements OnInit {
  planes: any[] = [];
  private readonly base = environment.apiUrl;  // ← tu base URL


  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    const userId = 1; // simulado por ahora
    this.http.get<any[]>(`${this.base}/planesNutricionales?userId=${userId}`)
      .subscribe(data => {
        this.planes = data;
      });
  }
}
