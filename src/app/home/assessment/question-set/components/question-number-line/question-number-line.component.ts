import { AfterViewInit, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl } from '@angular/forms';
import { DomSanitizer, SafeStyle } from '@angular/platform-browser';
import { BehaviorSubject } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { AnswerNumberLine } from 'src/app/core/models/answer.model';
import { QuestionNumberLine } from 'src/app/core/models/question.model';
import { AssisstantService } from 'src/app/core/services/assisstant.service';
import { PageNames } from 'src/app/core/utils/constants';
import { TutorialService } from 'src/app/core/services/tutorial.service';
import { TutorialSlideshowService } from 'src/app/core/services/tutorial-slideshow.service';

@Component({
  selector: 'app-question-number-line',
  templateUrl: './question-number-line.component.html',
  styleUrls: ['./question-number-line.component.scss']
})
export class QuestionNumberLineComponent implements OnInit, AfterViewInit {
  @Input() question: QuestionNumberLine;
  @Input() answer: AnswerNumberLine;
  @Input() displayCorrectAnswer: BehaviorSubject<boolean>;
  @Input() resetAnswer: BehaviorSubject<boolean>;
  @Output() answerChange = new EventEmitter<{answer: AnswerNumberLine; next: boolean}>();

  public dropListData: number[];
  public draggableOptions: number[];
  public valueForm = new FormControl(null);

  private readonly pageID = 'question-number-line-page';

  constructor(
    private assisstantService: AssisstantService,
    private tutorialSerice: TutorialService,
    public translate: TranslateService,
    private tutorialSlideshowService: TutorialSlideshowService,
    private sanitizer: DomSanitizer
    ) { }

  public get cssVars(): SafeStyle {
    const tickNb = (this.question?.end - this.question?.start) / this.question?.step;
    return this.sanitizer.bypassSecurityTrustStyle('--tick-nb: ' + (tickNb ?? 10));
  }

  ngOnInit(): void {
    this.assisstantService.setPageID(this.pageID);
    this.tutorialSlideshowService.showTutorialForPage(this.pageID);
    this.initNumberlineData();
    this.valueForm.valueChanges.subscribe(value => {
      this.submit(value);
    });
    this.resetAnswer.subscribe((value: boolean) => {
      if (value) {
        this.valueForm.reset();
        this.initNumberlineData();
      }
    });
  }

  ngAfterViewInit(): void {
    this.tutorialSerice.currentPage.next(PageNames.questionNumberLine);
  }

  public registerDrop(optionsArr: any[], optionIndex: number): void {
    this.valueForm.setValue(optionsArr[optionIndex]);
    optionsArr.splice(optionIndex, 1);
  }

  public getNumberColor(value: number): string {
    const numberColors = [
      '#8D6B91', '#00A3DA', '#47BBBA', '#33AC7D', '#73B932', '#25983C',
      '#F89F04', '#EC6F1B', '#CC0E2F', '#B9358B'
    ];
    return numberColors[Math.abs(value / this.question.step) % numberColors.length];
  }

  private initNumberlineData(): void {
    this.draggableOptions = [];
    for (let i = this.question.start; i <= this.question.end; i += this.question.step) {
      this.draggableOptions.push(i);
    }
    this.dropListData = this.draggableOptions.map(
      e => this.question.expected_value === e ? null : e
    );

    if (this.question.shuffle) {
      this.draggableOptions = this.draggableOptions.map(option => ({
        option,
        sort: Math.random()
      })).sort((a, b) => a.sort - b.sort).map(({ option }) => option);
    }
  }

  private submit(value): void {
    if (!value) {
      return;
    }
    const isValid = value === this.question.expected_value;
    if (!this.answer) {
      this.answer = {
        value,
        question: this.question.id,
        attempt: isValid,
        valid: isValid
      };
    } else {
      this.answer.attempt = isValid;
    }
    this.tutorialSerice.currentPage.next(PageNames.question);
    this.answerChange.emit({answer: this.answer, next: this.answer.attempt});
  }
}
