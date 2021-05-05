import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QuestionSortComponent } from './question-sort.component';

describe('QuestionSortComponent', () => {
  let component: QuestionSortComponent;
  let fixture: ComponentFixture<QuestionSortComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ QuestionSortComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(QuestionSortComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
