import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CompletedTopicComponent } from './completed-topic.component';

describe('CompletedTopicComponent', () => {
  let component: CompletedTopicComponent;
  let fixture: ComponentFixture<CompletedTopicComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CompletedTopicComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CompletedTopicComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
