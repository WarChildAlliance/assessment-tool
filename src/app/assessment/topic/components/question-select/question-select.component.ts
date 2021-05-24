import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl } from '@angular/forms';
import { AnswerSelect } from 'src/app/core/models/answer.model';
import { QuestionSelect, SelectOption } from 'src/app/core/models/question.model';

@Component({
  selector: 'app-question-select',
  templateUrl: './question-select.component.html',
  styleUrls: ['./question-select.component.scss']
})
export class QuestionSelectComponent implements OnInit {
  @Input() question: QuestionSelect;
  @Input() answer: AnswerSelect;
  @Output() answerChange = new EventEmitter<AnswerSelect>();


  valueForm = new FormControl(null);

  constructor() { }

  ngOnInit(): void {

    this.valueForm.valueChanges.subscribe(value => {
      if (value) {
        if (!this.answer) {
          this.answer = {
            selected_options: this.formatSelectedOptions(value),
            question: this.question.id,
            duration: 0,
            valid: this.isValid()
          };
        } else {
          this.answer.selected_options = this.formatSelectedOptions(value);
          this.answer.valid = this.isValid();
        }
        this.answerChange.emit(this.answer);
      }
    });
  }

  private isValid(): boolean {
    if (!this.question.multiple) {
      return this.valueForm.value.valid;
    }
    const validOptionsLength = this.question.options.filter(option => option.valid).length;
    const selectedOptionsLength = this.valueForm.value.filter(option => option.valid).length;
    return validOptionsLength === selectedOptionsLength;
  }

  private formatSelectedOptions(value: SelectOption | SelectOption[]): number[] {
    if (Array.isArray(value)) {
      return value.map(option => option.id);
    }

    return [value.id];
  }
}
