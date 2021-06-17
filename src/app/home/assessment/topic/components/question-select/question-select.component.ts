import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { AnswerSelect } from 'src/app/core/models/answer.model';
import { QuestionSelect, SelectOption } from 'src/app/core/models/question.model';

@Component({
  selector: 'app-question-select',
  templateUrl: './question-select.component.html',
  styleUrls: ['./question-select.component.scss']
})
export class QuestionSelectComponent implements OnInit {
  @Input() answer: AnswerSelect;
  @Output() answerChange = new EventEmitter<AnswerSelect>();

  @Input() question: QuestionSelect;

  valueForm = new FormControl(null);
  multipleSelectForm: FormGroup = new FormGroup({
    selectedOptions: new FormArray([]),
  });

  selectedOptions = [];

  constructor(private formBuilder: FormBuilder) { }

  ngOnInit(): void {

    if (this.question.multiple) {

      this.generateMultipleSelectForm();

      this.multipleSelectForm.valueChanges.subscribe(value => {
        this.selectedOptions = [];
        value.selectedOptions.forEach((val, index) => {
          if (val.selected) {
            this.selectedOptions.push(this.question.options[index]);

            if (!this.answer) {
              this.answer = {
                selected_options: this.formatSelectedOptions(this.question.options[index]),
                question: this.question.id,
                duration: '',
                valid: this.isValid()
              };
            } else {
              this.answer.selected_options = this.formatSelectedOptions(this.question.options[index]);
              this.answer.valid = this.isValid();
            }

            this.answerChange.emit(this.answer);
          }
        });
      });
    } else {
      this.valueForm.valueChanges.subscribe(value => {
        if (value) {
          if (!this.answer) {
            this.answer = {
              selected_options: this.formatSelectedOptions(value),
              question: this.question.id,
              duration: '',
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
  }

  private generateMultipleSelectForm(): void {
    const selectedOptionsForm = this.multipleSelectForm.get('selectedOptions') as FormArray;

    this.question.options.forEach((option) => {
      const selectOption = this.formBuilder.group({
        selected: new FormControl(false),
      });
      selectedOptionsForm.push(selectOption);
    });
  }

  private isValid(): boolean {
    if (!this.question.multiple) {
      return this.valueForm.value.valid;
    }
    const validOptionsLength = this.question.options.filter(option => option.valid).length;
    const validSelectedOptionsLength = this.selectedOptions.filter(option => option.valid).length;
    return validOptionsLength === validSelectedOptionsLength;
  }

  private formatSelectedOptions(value: SelectOption | SelectOption[]): number[] {
    if (Array.isArray(value)) {
      return value.map(option => option.id);
    }

    return [value.id];
  }
}
