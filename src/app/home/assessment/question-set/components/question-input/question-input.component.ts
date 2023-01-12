import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output
} from '@angular/core';
import { FormControl } from '@angular/forms';
import { AnswerInput } from 'src/app/core/models/answer.model';
import { QuestionInput } from 'src/app/core/models/question.model';
import { BehaviorSubject } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-question-input',
  templateUrl: './question-input.component.html',
  styleUrls: ['./question-input.component.scss']
})
export class QuestionInputComponent implements OnInit {
  @Input() question: QuestionInput;
  @Input() answer: AnswerInput;
  @Input() displayCorrectAnswer: BehaviorSubject<boolean>;
  @Output() answerChange = new EventEmitter<{answer: AnswerInput; next: boolean}>();


  public valueForm = new FormControl(null);
  public firstAttempt = true;

  constructor(
    public translate: TranslateService)
    { }

  ngOnInit(): void {
    this.valueForm.valueChanges.subscribe(value => {
      if (value) {
        if (!this.answer) {
          this.answer = {
            value,
            question: this.question.id,
            attempt: this.isValid(),
            valid: this.isValid()
          };
        } else {
          this.answer.attempt = this.isValid();
        }
      }
    });
  }

  public handleSubmit(): void {
    if (this.firstAttempt) {
      this.answer.value = this.valueForm.value;
      this.answer.valid = this.isValid();
      this.firstAttempt = false;
    }
    this.answerChange.emit({answer: this.answer, next: this.answer.attempt});
  }

  private isValid(): boolean {
    return this.valueForm.value === this.question.valid_answer;
  }
}
