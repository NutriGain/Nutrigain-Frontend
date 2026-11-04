import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { ApiService } from '../../../../../../core/api.service';
import { Avatar } from '../../../../../../core/models';
import { moodEs } from '../../../../../../core/i18n';

@Component({
  selector: 'app-avatar-card',
  imports: [CommonModule, MatCardModule],
  templateUrl: './avatar-card.component.html',
  standalone: true,
  styleUrl: './avatar-card.component.css'
})
export class AvatarCardComponent implements OnInit {
  avatar?: Avatar;

  readonly moodEs = moodEs;

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.api.getAvatar().subscribe(avatar => (this.avatar = avatar));
  }

  fallbackImage(event: Event): void {
    (event.target as HTMLImageElement).src = 'assets/avatar1.png';
  }
}
