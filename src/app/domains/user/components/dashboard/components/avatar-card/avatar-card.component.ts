import {Component, OnInit} from '@angular/core';
import { CommonModule } from '@angular/common';
import {HttpClient} from '@angular/common/http';
import {MatCard, MatCardModule} from '@angular/material/card';

@Component({
  selector: 'app-avatar-card',
  imports: [CommonModule, MatCardModule,
    MatCard
  ],
  templateUrl: './avatar-card.component.html',
  standalone: true,
  styleUrl: './avatar-card.component.css'
})

export class AvatarCardComponent implements OnInit {
  avatar: any;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    const userId = 1;
    this.http.get<any[]>(`https://fake-api-murex-one.vercel.app/avatares?userId=${userId}`)
      .subscribe(data => {
        this.avatar = data[0];
      });
  }
}
