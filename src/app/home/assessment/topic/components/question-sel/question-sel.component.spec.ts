import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QuestionSelComponent } from './question-sel.component';

describe('QuestionSelComponent', () => {
  let component: QuestionSelComponent;
  let fixture: ComponentFixture<QuestionSelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ QuestionSelComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(QuestionSelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
