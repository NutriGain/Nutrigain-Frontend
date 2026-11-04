import { Component, ElementRef, Input, NgZone, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface ChartPoint {
  label: string;
  value: number;
}

let nextId = 0;

/** Responsive SVG line chart with area fill, grid and a hover tooltip. Handles 0, 1 or many points. */
@Component({
  selector: 'app-line-chart',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="wrap" *ngIf="coords.length; else empty">
      <svg [attr.viewBox]="'0 0 ' + W + ' ' + H" role="img" [attr.aria-label]="ariaLabel">
        <defs>
          <linearGradient [attr.id]="uid" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#10b981" stop-opacity="0.30"></stop>
            <stop offset="100%" stop-color="#10b981" stop-opacity="0"></stop>
          </linearGradient>
        </defs>
        <g class="grid">
          <ng-container *ngFor="let t of ticks">
            <line [attr.x1]="padL" [attr.x2]="W - padR" [attr.y1]="t.y" [attr.y2]="t.y"></line>
            <text [attr.x]="padL - 10" [attr.y]="t.y + 4" text-anchor="end">{{ t.label }}</text>
          </ng-container>
        </g>
        <path *ngIf="coords.length > 1" [attr.d]="areaPath" [attr.fill]="'url(#' + uid + ')'"></path>
        <path *ngIf="coords.length > 1" class="line" [attr.d]="linePath"></path>
        <g *ngFor="let c of coords; let i = index">
          <circle class="dot" [class.on]="hover === i" [attr.cx]="c.x" [attr.cy]="c.y" [attr.r]="hover === i ? 7 : 5"></circle>
          <rect class="hit" [attr.x]="c.x - hitW / 2" y="0" [attr.width]="hitW" [attr.height]="H"
                (mouseenter)="hover = i" (mouseleave)="hover = null" (click)="hover = i"></rect>
        </g>
        <text *ngFor="let l of xLabels" class="xl" [attr.x]="l.x" [attr.y]="H - 10" text-anchor="middle">{{ l.text }}</text>
        <g *ngIf="tip" class="tip" [attr.transform]="'translate(' + tip.x + ',' + tip.y + ')'">
          <rect width="116" height="44" rx="10"></rect>
          <text x="58" y="19" text-anchor="middle" class="tv">{{ tip.value }}{{ unit }}</text>
          <text x="58" y="35" text-anchor="middle" class="tl">{{ tip.label }}</text>
        </g>
      </svg>
    </div>
    <ng-template #empty>
      <div class="empty-chart"><span class="material-icons">show_chart</span>{{ emptyText }}</div>
    </ng-template>
  `,
  styles: [`
    :host { display: block; }
    svg { width: 100%; height: auto; display: block; overflow: visible; }
    .grid line { stroke: #e8ecf1; stroke-width: 1; stroke-dasharray: 3 5; }
    .grid text, .xl { fill: #94a3b8; font-size: 12px; font-family: inherit; }
    .line { fill: none; stroke: #10b981; stroke-width: 3.5; stroke-linecap: round; stroke-linejoin: round; }
    .dot { fill: #fff; stroke: #10b981; stroke-width: 3; transition: r .12s ease; }
    .dot.on { fill: #10b981; }
    .hit { fill: transparent; cursor: pointer; }
    .tip rect { fill: #0f172a; }
    .tip .tv { fill: #fff; font-weight: 700; font-size: 14px; }
    .tip .tl { fill: #94a3b8; font-size: 11px; }
    .empty-chart { height: 200px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 6px; color: #94a3b8; font-size: 14px; border: 1.5px dashed #dbe2ea; border-radius: 12px; }
    .empty-chart .material-icons { font-size: 32px; color: #cbd5e1; }
  `]
})
export class LineChartComponent implements OnInit, OnDestroy {
  readonly uid = 'lc' + nextId++;
  /** Drawing width follows the container so text keeps its real size on any screen. */
  W = 640;
  H = 260;
  readonly padL = 48;
  readonly padR = 20;
  private readonly padT = 20;
  private readonly padB = 34;

  @Input() unit = '';
  @Input() emptyText = 'Aún no hay datos para mostrar';
  @Input() ariaLabel = 'Gráfico de líneas';

  hover: number | null = null;
  coords: { x: number; y: number; p: ChartPoint }[] = [];
  ticks: { y: number; label: string }[] = [];
  xLabels: { x: number; text: string }[] = [];
  linePath = '';
  areaPath = '';
  hitW = 40;

  private lastPoints: ChartPoint[] = [];
  private observer?: ResizeObserver;

  constructor(private host: ElementRef<HTMLElement>, private zone: NgZone) {}

  @Input() set points(value: ChartPoint[] | null | undefined) {
    this.lastPoints = value ?? [];
    this.compute(this.lastPoints);
  }

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
          this.compute(this.lastPoints);
        });
      }
    });
    this.observer.observe(this.host.nativeElement);
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
  }

  get tip(): { x: number; y: number; value: number; label: string } | null {
    if (this.hover === null || !this.coords[this.hover]) {
      return null;
    }
    const c = this.coords[this.hover];
    return {
      x: Math.min(Math.max(c.x - 58, 4), this.W - 120),
      y: Math.max(c.y - 56, 2),
      value: c.p.value,
      label: c.p.label
    };
  }

  private compute(points: ChartPoint[]): void {
    this.hover = null;
    if (!points.length) {
      this.coords = [];
      this.ticks = [];
      this.xLabels = [];
      this.linePath = this.areaPath = '';
      return;
    }
    const values = points.map(p => p.value);
    let min = Math.min(...values);
    let max = Math.max(...values);
    if (min === max) {
      min -= 2;
      max += 2;
    }
    const span = max - min;
    min = Math.floor(min - span * 0.15);
    max = Math.ceil(max + span * 0.15);

    const plotW = this.W - this.padL - this.padR;
    const plotH = this.H - this.padT - this.padB;
    const n = points.length;
    const x = (i: number) => (n === 1 ? this.padL + plotW / 2 : this.padL + (plotW * i) / (n - 1));
    const y = (v: number) => this.padT + plotH * (1 - (v - min) / (max - min));
    const baseY = this.padT + plotH;

    this.coords = points.map((p, i) => ({ x: x(i), y: y(p.value), p }));
    this.hitW = Math.max(24, plotW / n);
    this.ticks = [0, 1, 2, 3].map(i => {
      const v = min + ((max - min) * i) / 3;
      return { y: y(v), label: String(Math.round(v * 10) / 10) };
    });

    let d = `M ${this.coords[0].x} ${this.coords[0].y}`;
    for (let i = 1; i < this.coords.length; i++) {
      const a = this.coords[i - 1];
      const b = this.coords[i];
      const mid = (a.x + b.x) / 2;
      d += ` C ${mid} ${a.y}, ${mid} ${b.y}, ${b.x} ${b.y}`;
    }
    this.linePath = d;
    const first = this.coords[0];
    const last = this.coords[this.coords.length - 1];
    this.areaPath = `${d} L ${last.x} ${baseY} L ${first.x} ${baseY} Z`;

    const step = Math.ceil(n / 6);
    this.xLabels = this.coords
      .map((c, i) => ({ x: c.x, text: c.p.label, i }))
      .filter(l => l.i % step === 0 || l.i === n - 1 && (n - 1) % step >= Math.ceil(step / 2))
      .map(l => ({ x: l.x, text: l.text }));
  }
}
