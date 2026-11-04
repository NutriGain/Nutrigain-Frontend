import { Component, Input } from '@angular/core';
import { NgIf } from '@angular/common';
import { RingComponent } from '../charts/ring.component';

const CHARACTERS: Record<string, { emoji: string; from: string; to: string }> = {
  Titan: { emoji: '💪', from: '#34d399', to: '#047857' },
  Rayo: { emoji: '⚡', from: '#fbbf24', to: '#ea580c' },
  Zen: { emoji: '🧘', from: '#a78bfa', to: '#6d28d9' }
};

/** The virtual companion: an illustrated badge wrapped in an XP ring, with the current level. */
@Component({
  selector: 'app-character-avatar',
  standalone: true,
  imports: [NgIf, RingComponent],
  template: `
    <app-ring [value]="percent" [size]="size" [stroke]="stroke" color="#10b981">
      <div class="face" [style.width.px]="size - stroke * 2 - 8" [style.height.px]="size - stroke * 2 - 8"
           [style.background]="'linear-gradient(135deg,' + look.from + ',' + look.to + ')'"
           [style.font-size.px]="size * 0.36">{{ look.emoji }}</div>
    </app-ring>
    <span class="level" *ngIf="level">Nv. {{ level }}</span>
  `,
  styles: [`
    :host { position: relative; display: inline-block; }
    .face { border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: inset 0 -6px 12px rgba(0, 0, 0, .15); }
    .level { position: absolute; right: -4px; bottom: 2px; background: #0f172a; color: #fff; font-size: 12px; font-weight: 700; padding: 3px 9px; border-radius: 999px; border: 2px solid #fff; }
  `]
})
export class CharacterAvatarComponent {
  @Input() name = '';
  @Input() level = 0;
  @Input() percent = 0;
  @Input() size = 112;
  @Input() stroke = 7;

  get look(): { emoji: string; from: string; to: string } {
    return CHARACTERS[this.name] ?? { emoji: '🏅', from: '#94a3b8', to: '#475569' };
  }
}
