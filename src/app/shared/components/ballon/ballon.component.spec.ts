import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BallonComponent } from './ballon.component';

describe('BallonComponent', () => {
  let component: BallonComponent;
  let fixture: ComponentFixture<BallonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BallonComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BallonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
