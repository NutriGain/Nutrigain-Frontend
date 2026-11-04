import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RetoCardComponent } from './reto-card.component';

describe('RetoCardComponent', () => {
  let component: RetoCardComponent;
  let fixture: ComponentFixture<RetoCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RetoCardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RetoCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
