import { Component, Input } from '@angular/core';

/** Circular progress. The projected content is centered inside the ring. */
@Component({
  selector: 'app-ring',
  standalone: true,
  template: `
    <div class="ring" [style.width.px]="size" [style.height.px]="size">
      <svg [attr.viewBox]="'0 0 ' + size + ' ' + size" [attr.width]="size" [attr.height]="size" role="img"
           [attr.aria-label]="'Progreso ' + clamped + '%'">
        <circle class="track" [attr.cx]="size / 2" [attr.cy]="size / 2" [attr.r]="radius" [attr.stroke-width]="stroke"></circle>
        <circle class="value" [attr.cx]="size / 2" [attr.cy]="size / 2" [attr.r]="radius" [attr.stroke-width]="stroke"
                [attr.stroke]="color" [attr.stroke-dasharray]="circumference"
                [attr.stroke-dashoffset]="circumference * (1 - clamped / 100)"
                [attr.transform]="'rotate(-90 ' + size / 2 + ' ' + size / 2 + ')'"></circle>
      </svg>
      <div class="center"><ng-content></ng-content></div>
    </div>
  `,
  styles: [`
    :host { display: inline-block; }
    .ring { position: relative; }
    svg { display: block; }
    .track { fill: none; stroke: #edf1f5; }
    .value { fill: none; stroke-linecap: round; transition: stroke-dashoffset .6s ease; }
    .center { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; }
  `]
})
export class RingComponent {
  @Input() value = 0;
  @Input() size = 96;
  @Input() stroke = 10;
  @Input() color = '#10b981';

  get clamped(): number {
    return Math.min(100, Math.max(0, Math.round(this.value)));
  }

  get radius(): number {
    return (this.size - this.stroke) / 2;
  }

  get circumference(): number {
    return 2 * Math.PI * this.radius;
  }
}
