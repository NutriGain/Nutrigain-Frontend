import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BodyweightCardComponent } from './bodyweight-card.component';

describe('BodyweightCardComponent', () => {
  let component: BodyweightCardComponent;
  let fixture: ComponentFixture<BodyweightCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BodyweightCardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BodyweightCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
