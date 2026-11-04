import { Component, ElementRef, Input, NgZone, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChartPoint } from './line-chart.component';

let nextId = 0;

/** Responsive SVG bar chart. The latest bar is highlighted. */
@Component({
  selector: 'app-bar-chart',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div *ngIf="bars.length; else empty">
      <svg [attr.viewBox]="'0 0 ' + W + ' ' + H" role="img" [attr.aria-label]="ariaLabel">
        <defs>
          <linearGradient [attr.id]="uid + 'a'" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#34d399"></stop>
            <stop offset="100%" stop-color="#059669"></stop>
          </linearGradient>
          <linearGradient [attr.id]="uid + 'b'" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#a7f3d0"></stop>
            <stop offset="100%" stop-color="#6ee7b7"></stop>
          </linearGradient>
        </defs>
        <g class="grid">
          <ng-container *ngFor="let t of ticks">
            <line [attr.x1]="padL" [attr.x2]="W - padR" [attr.y1]="t.y" [attr.y2]="t.y"></line>
            <text [attr.x]="padL - 10" [attr.y]="t.y + 4" text-anchor="end">{{ t.label }}</text>
          </ng-container>
        </g>
        <g *ngFor="let b of geometry; let i = index" (mouseenter)="hover = i" (mouseleave)="hover = null">
          <rect class="bar" [attr.x]="b.x" [attr.y]="b.y" [attr.width]="b.w" [attr.height]="b.h" rx="8"
                [attr.fill]="'url(#' + uid + (i === geometry.length - 1 || hover === i ? 'a' : 'b') + ')'"></rect>
          <text class="val" [attr.x]="b.x + b.w / 2" [attr.y]="b.y - 8" text-anchor="middle">{{ b.value }}{{ unit }}</text>
          <text class="xl" [attr.x]="b.x + b.w / 2" [attr.y]="H - 10" text-anchor="middle">{{ b.label }}</text>
        </g>
      </svg>
    </div>
    <ng-template #empty>
      <div class="empty-chart"><span class="material-icons">bar_chart</span>{{ emptyText }}</div>
    </ng-template>
  `,
  styles: [`
    :host { display: block; }
    svg { width: 100%; height: auto; display: block; overflow: visible; }
    .grid line { stroke: #e8ecf1; stroke-width: 1; stroke-dasharray: 3 5; }
    .grid text, .xl { fill: #94a3b8; font-size: 12px; font-family: inherit; }
    .val { fill: #334155; font-size: 12px; font-weight: 700; font-family: inherit; }
    .bar { transition: fill .15s ease; }
    .empty-chart { height: 200px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 6px; color: #94a3b8; font-size: 14px; border: 1.5px dashed #dbe2ea; border-radius: 12px; }
    .empty-chart .material-icons { font-size: 32px; color: #cbd5e1; }
  `]
})
export class BarChartComponent implements OnInit, OnDestroy {
  readonly uid = 'bc' + nextId++;
  /** Drawing width follows the container so text keeps its real size on any screen. */
  W = 640;
  H = 260;
  private observer?: ResizeObserver;

  constructor(private host: ElementRef<HTMLElement>, private zone: NgZone) {}

  ngOnInit(): void {
    if (typeof ResizeObserver === 'undefined') {
      return;
    }
    this.observer = new ResizeObserver(entries => {
      const width = Math.round(entries[0].contentRect.width);
      if (width > 0 && Math.max(280, width) !== this.W) {
        this.zone.run(() => {
          this.W = Math.max(280, width);
          this.H = this.W < 480 ? 220 : 260;
          this.compute();
        });
      }
    });
    this.observer.observe(this.host.nativeElement);
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
  }
  readonly padL = 44;
  readonly padR = 16;
  private readonly padT = 28;
  private readonly padB = 34;

  @Input() unit = '%';
  @Input() max = 100;
  @Input() emptyText = 'Aún no hay datos para mostrar';
  @Input() ariaLabel = 'Gráfico de barras';

  bars: ChartPoint[] = [];
  geometry: { x: number; y: number; w: number; h: number; value: number; label: string }[] = [];
  ticks: { y: number; label: string }[] = [];
  hover: number | null = null;

  @Input() set data(value: ChartPoint[] | null | undefined) {
    this.bars = value ?? [];
    this.compute();
  }

  private compute(): void {
    const plotW = this.W - this.padL - this.padR;
    const plotH = this.H - this.padT - this.padB;
    const top = Math.max(this.max, ...this.bars.map(b => b.value), 1);
    const y = (v: number) => this.padT + plotH * (1 - v / top);
    const band = plotW / Math.max(this.bars.length, 1);
    const barW = Math.min(56, band * 0.58);
    this.ticks = [0, 1, 2, 3, 4].map(i => {
      const v = (top * i) / 4;
      return { y: y(v), label: String(Math.round(v)) };
    });
    this.geometry = this.bars.map((b, i) => {
      const h = Math.max(plotH * (b.value / top), b.value > 0 ? 6 : 3);
      return { x: this.padL + band * i + (band - barW) / 2, y: this.padT + plotH - h, w: barW, h, value: b.value, label: b.label };
    });
  }
}
