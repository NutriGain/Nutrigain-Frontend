import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import {environment} from '../../../../../environments/environment';

@Component({
  selector: 'app-avatar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './avatar.component.html',
  styleUrls: ['./avatar.component.css']
})
export class AvatarComponent implements OnInit {
  avatar: any;

  private readonly base = environment.apiUrl;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    const userId = 1;
    this.http.get<any[]>(`${this.base}/avatares?userId=${userId}`)
      .subscribe(data => {
        if (data.length > 0) {
          this.avatar = data[0];
        }
      });
  }
}
