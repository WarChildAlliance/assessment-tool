import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl } from '@angular/forms';
import { AnswerInput } from 'src/app/core/models/answer.model';
import { QuestionInput } from 'src/app/core/models/question.model';

@Component({
  selector: 'app-question-input',
  templateUrl: './question-input.component.html',
  styleUrls: ['./question-input.component.scss']
})
export class QuestionInputComponent implements OnInit {
  @Input() question: QuestionInput;
  @Input() answer: AnswerInput;
  @Output() answerChange = new EventEmitter<AnswerInput>();

  valueForm = new FormControl(null);

  constructor() { }

  ngOnInit(): void {
    this.valueForm.valueChanges.subscribe(value => {
      if (value) {
        if (!this.answer) {
          this.answer = {
            value,
            question: this.question.id,
            duration: '',
            valid: this.isValid()
          };
        } else {
          this.answer.value = value;
          this.answer.valid = this.isValid();
        }
        this.answerChange.emit(this.answer);
      }
    });
  }

  private isValid(): boolean {
    return this.valueForm.value === this.question.valid_answer;
  }
}
