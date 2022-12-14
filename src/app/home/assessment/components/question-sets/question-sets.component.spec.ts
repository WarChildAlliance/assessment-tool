import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QuestionSetsComponent } from './question-sets.component';

describe('QuestionSetsComponent', () => {
  let component: QuestionSetsComponent;
  let fixture: ComponentFixture<QuestionSetsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ QuestionSetsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(QuestionSetsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
