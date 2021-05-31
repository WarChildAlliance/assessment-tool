import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StudentPointsComponent } from './student-points.component';

describe('StudentPointsComponent', () => {
  let component: StudentPointsComponent;
  let fixture: ComponentFixture<StudentPointsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ StudentPointsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(StudentPointsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
