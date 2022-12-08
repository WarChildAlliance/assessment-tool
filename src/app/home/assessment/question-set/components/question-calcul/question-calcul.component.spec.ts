import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QuestionCalculComponent } from './question-calcul.component';

describe('QuestionCalculComponent', () => {
  let component: QuestionCalculComponent;
  let fixture: ComponentFixture<QuestionCalculComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ QuestionCalculComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(QuestionCalculComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
