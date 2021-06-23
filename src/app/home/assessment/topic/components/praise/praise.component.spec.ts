import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PraiseComponent } from './praise.component';

describe('PraiseComponent', () => {
  let component: PraiseComponent;
  let fixture: ComponentFixture<PraiseComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PraiseComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PraiseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
