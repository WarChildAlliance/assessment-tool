import { AfterViewInit, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl } from '@angular/forms';
import { AnswerNumberLine } from 'src/app/core/models/answer.model';
import { QuestionNumberLine } from 'src/app/core/models/question.model';
import { BehaviorSubject } from 'rxjs';
import { AssisstantService } from 'src/app/core/services/assisstant.service';
import { PageNames } from 'src/app/core/utils/constants';
import { TutorialService } from 'src/app/core/services/tutorial.service';
import { TranslateService } from '@ngx-translate/core';


@Component({
  selector: 'app-question-number-line',
  templateUrl: './question-number-line.component.html',
  styleUrls: ['./question-number-line.component.scss']
})
export class QuestionNumberLineComponent implements OnInit, AfterViewInit {
  @Input() question: QuestionNumberLine;
  @Input() answer: AnswerNumberLine;
  @Input() displayCorrectAnswer: BehaviorSubject<boolean>;
  @Output() answerChange = new EventEmitter<AnswerNumberLine>();

  valueForm = new FormControl(null);
  private readonly pageID = 'question-number-line-page';

  constructor(
    private assisstantService: AssisstantService,
    private tutorialSerice: TutorialService,
    public translate: TranslateService) { }

  ngOnInit(): void {
    this.assisstantService.setPageID(this.pageID);
    this.valueForm.valueChanges.subscribe(value => {
      this.submit(value);
    });
  }

  private submit(value): void {
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
      this.tutorialSerice.currentPage.next(PageNames.question);
      this.answerChange.emit(this.answer);
    }
  }

  private isValid(): boolean {
    const errorMargin = (!this.question.show_ticks || this.question.tick_step !== 1) ? (this.question.end * 10) / 100 : 0;
    if (this.valueForm.value >= this.question.expected_value - errorMargin
      && this.valueForm.value <= this.question.expected_value + errorMargin) {
      return true;
    }
    return false;
  }

  ngAfterViewInit(): void {
    this.tutorialSerice.currentPage.next(PageNames.questionNumberLine);
  }
}
