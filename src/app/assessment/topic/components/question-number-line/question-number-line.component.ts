import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl } from '@angular/forms';
import { AnswerNumberLine } from 'src/app/core/models/answer.model';
import { QuestionNumberLine } from 'src/app/core/models/question.model';

@Component({
  selector: 'app-question-number-line',
  templateUrl: './question-number-line.component.html',
  styleUrls: ['./question-number-line.component.scss']
})
export class QuestionNumberLineComponent implements OnInit {
  @Input() question: QuestionNumberLine;
  @Input() answer: AnswerNumberLine;
  @Output() answerChange = new EventEmitter<AnswerNumberLine>();

  valueForm = new FormControl(null);

  constructor() { }

  ngOnInit(): void {
    this.valueForm.valueChanges.subscribe(value => {
      if (value) {
        if (!this.answer) {
          this.answer = {
            value,
            question: this.question.id,
            duration: 0,
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
    return this.valueForm.value === this.question.expected_value;
  }
}
