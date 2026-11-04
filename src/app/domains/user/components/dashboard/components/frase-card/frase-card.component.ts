import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { ApiService } from '../../../../../../core/api.service';

@Component({
  selector: 'app-frase-card',
  standalone: true,
  imports: [CommonModule, MatCardModule],
  templateUrl: './frase-card.component.html',
  styleUrls: ['./frase-card.component.css']
})
export class FraseCardComponent implements OnInit {
  frase = '';

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.api.getRandomMessage().subscribe(message => (this.frase = message.text));
  }
}
