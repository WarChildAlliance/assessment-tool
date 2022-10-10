import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QuestionDominoComponent } from './question-domino.component';

describe('QuestionDominoComponent', () => {
  let component: QuestionDominoComponent;
  let fixture: ComponentFixture<QuestionDominoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ QuestionDominoComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(QuestionDominoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
