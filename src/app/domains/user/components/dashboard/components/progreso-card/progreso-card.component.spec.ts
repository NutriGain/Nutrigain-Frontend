import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProgresoCardComponent } from './progreso-card.component';

describe('ProgresoCardComponent', () => {
  let component: ProgresoCardComponent;
  let fixture: ComponentFixture<ProgresoCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProgresoCardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProgresoCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
