import { TestBed } from '@angular/core/testing';
import { BarChartComponent } from './bar-chart.component';
import { LineChartComponent } from './line-chart.component';
import { RingComponent } from './ring.component';

describe('LineChartComponent', () => {
  function create(points: { label: string; value: number }[]) {
    const fixture = TestBed.createComponent(LineChartComponent);
    fixture.componentInstance.points = points;
    fixture.detectChanges();
    return fixture;
  }

  it('shows the empty state when there is no data', () => {
    const fixture = create([]);
    expect(fixture.nativeElement.querySelector('.empty-chart')).not.toBeNull();
    expect(fixture.nativeElement.querySelector('svg')).toBeNull();
  });

  it('draws a single point as a dot without a line', () => {
    const fixture = create([{ label: '01 nov', value: 70 }]);
    expect(fixture.nativeElement.querySelectorAll('circle.dot').length).toBe(1);
    expect(fixture.nativeElement.querySelector('path.line')).toBeNull();
  });

  it('draws a line, an area and one dot per point', () => {
    const fixture = create([
      { label: '01', value: 70 },
      { label: '02', value: 69 },
      { label: '03', value: 68.5 }
    ]);
    expect(fixture.nativeElement.querySelector('path.line')).not.toBeNull();
    expect(fixture.nativeElement.querySelectorAll('circle.dot').length).toBe(3);
  });

  it('keeps every point inside the plot area even when all values are equal', () => {
    const fixture = create([
      { label: '01', value: 70 },
      { label: '02', value: 70 }
    ]);
    const chart = fixture.componentInstance;
    for (const c of chart.coords) {
      expect(c.y).toBeGreaterThan(0);
      expect(c.y).toBeLessThan(chart.H);
    }
  });

  it('shows a tooltip for the hovered point', () => {
    const fixture = create([
      { label: '01', value: 70 },
      { label: '02', value: 68 }
    ]);
    fixture.componentInstance.hover = 1;
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.tip .tv').textContent).toContain('68');
  });
});

describe('BarChartComponent', () => {
  it('draws one bar per datum, scaled to the maximum', () => {
    const fixture = TestBed.createComponent(BarChartComponent);
    fixture.componentInstance.data = [
      { label: 'a', value: 25 },
      { label: 'b', value: 100 }
    ];
    fixture.detectChanges();
    const bars = fixture.componentInstance.geometry;
    expect(bars.length).toBe(2);
    expect(bars[1].h).toBeGreaterThan(bars[0].h);
  });

  it('shows the empty state without data', () => {
    const fixture = TestBed.createComponent(BarChartComponent);
    fixture.componentInstance.data = [];
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.empty-chart')).not.toBeNull();
  });
});

describe('RingComponent', () => {
  it('clamps the value between 0 and 100', () => {
    const ring = TestBed.createComponent(RingComponent).componentInstance;
    ring.value = 250;
    expect(ring.clamped).toBe(100);
    ring.value = -5;
    expect(ring.clamped).toBe(0);
  });
});
