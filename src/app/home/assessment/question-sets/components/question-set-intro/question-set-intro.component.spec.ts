import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QuestionSetIntroComponent } from './question-set-intro.component';

describe('QuestionSetIntroComponent', () => {
  let component: QuestionSetIntroComponent;
  let fixture: ComponentFixture<QuestionSetIntroComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ QuestionSetIntroComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(QuestionSetIntroComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
