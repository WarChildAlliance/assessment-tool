import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QuestionNumberLineComponent } from './question-number-line.component';

describe('QuestionNumberLineComponent', () => {
  let component: QuestionNumberLineComponent;
  let fixture: ComponentFixture<QuestionNumberLineComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ QuestionNumberLineComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(QuestionNumberLineComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
