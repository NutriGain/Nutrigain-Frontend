import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AvatarCardComponent } from './avatar-card.component';

describe('AvatarCardComponent', () => {
  let component: AvatarCardComponent;
  let fixture: ComponentFixture<AvatarCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AvatarCardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AvatarCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
