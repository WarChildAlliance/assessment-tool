import {
  AfterContentChecked,
  AfterContentInit,
  AfterViewInit, ChangeDetectorRef,
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
import { AssisstantService } from 'src/app/core/services/assisstant.service';
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

  @Output() answerChange = new EventEmitter<AnswerInput>();

  private readonly pageID = 'question-input-page';

  public valueForm = new FormControl(null);

  constructor(
    private assisstantService: AssisstantService,
    public translate: TranslateService)
    { }

  ngOnInit(): void {
    this.assisstantService.setPageID(this.pageID);
    this.valueForm.valueChanges.subscribe(value => {
      if (value) {
        if (!this.answer) {
          this.answer = {
            value,
            question: this.question.id,
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
