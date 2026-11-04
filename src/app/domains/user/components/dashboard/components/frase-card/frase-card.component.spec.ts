import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FraseCardComponent } from './frase-card.component';

describe('FraseCardComponent', () => {
  let component: FraseCardComponent;
  let fixture: ComponentFixture<FraseCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FraseCardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FraseCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
