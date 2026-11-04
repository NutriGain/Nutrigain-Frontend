import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../../../core/api.service';
import { Avatar } from '../../../../core/models';
import { moodEs } from '../../../../core/i18n';

@Component({
  selector: 'app-avatar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './avatar.component.html',
  styleUrls: ['./avatar.component.css']
})
export class AvatarComponent implements OnInit {
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
