import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QuestionDragAndDropComponent } from './question-drag-and-drop.component';

describe('QuestionDragAndDropComponent', () => {
  let component: QuestionDragAndDropComponent;
  let fixture: ComponentFixture<QuestionDragAndDropComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ QuestionDragAndDropComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(QuestionDragAndDropComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
