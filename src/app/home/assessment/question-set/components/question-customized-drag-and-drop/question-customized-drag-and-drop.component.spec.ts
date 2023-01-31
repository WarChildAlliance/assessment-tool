import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QuestionCustomizedDragAndDropComponent } from './question-customized-drag-and-drop.component';

describe('QuestionCustomizedDragAndDropComponent', () => {
  let component: QuestionCustomizedDragAndDropComponent;
  let fixture: ComponentFixture<QuestionCustomizedDragAndDropComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ QuestionCustomizedDragAndDropComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(QuestionCustomizedDragAndDropComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
