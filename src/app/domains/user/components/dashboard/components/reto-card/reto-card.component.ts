import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-reto-card',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule],
  templateUrl: './reto-card.component.html',
  styleUrls: ['./reto-card.component.css']
})
export class RetoCardComponent implements OnInit {
  reto: any;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.obtenerReto();
  }

  obtenerReto(): void {
    this.http.get<any[]>('https://fake-api-murex-one.vercel.app/retos').subscribe(data => {
      const index = Math.floor(Math.random() * data.length);
      this.reto = data[index];
    });
  }
}
