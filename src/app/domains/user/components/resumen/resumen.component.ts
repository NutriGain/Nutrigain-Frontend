import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import {environment} from '../../../../../environments/environment';

@Component({
  selector: 'app-resumen',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './resumen.component.html',
  styleUrls: ['./resumen.component.css']
})
export class ResumenComponent implements OnInit {
  user: any;
  avatar: any;
  progreso: any;
  ultimaComida: any;
  reto: any;
  progresoCompleto: boolean = false;

  // construye tu base una sola vez
  private readonly base = environment.apiUrl;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    const userId = 1;

    this.http.get<any>(`${this.base}/users/${userId}`).subscribe(u => this.user = u);
    this.http.get<any[]>(`${this.base}/avatares?userId=${userId}`).subscribe(data => this.avatar = data[0]);

    this.http.get<any[]>(`${this.base}/progresos?userId=${userId}`).subscribe(data => {
      const last = data[data.length - 1];
      this.progreso = last?.porcentajeCompletado;
      this.progresoCompleto = this.progreso === 100;
    });

    this.http.get<any[]>(`${this.base}/planesNutricionales?userId=${userId}`).subscribe(data => {
      const ultima = data[data.length - 1];
      this.ultimaComida = ultima?.comidas[ultima.comidas.length - 1];
    });

    this.http.get<any[]>(`${this.base}/retos`).subscribe(data => {
      this.reto = data[Math.floor(Math.random() * data.length)];
    });
  }
}
