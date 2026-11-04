import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-frase-card',
  standalone: true,
  imports: [CommonModule, MatCardModule],
  templateUrl: './frase-card.component.html',
  styleUrls: ['./frase-card.component.css']
})
export class FraseCardComponent implements OnInit {
  frase: string = '';

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.http.get<any[]>('https://fake-api-murex-one.vercel.app/mensajesMotivacionales')
      .subscribe(data => {
        const index = Math.floor(Math.random() * data.length);
        this.frase = data[index]?.texto;
      });
  }
}
