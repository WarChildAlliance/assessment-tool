import { ChangeDetectorRef, Component, HostListener, OnInit } from '@angular/core';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import * as moment from 'moment';
import { Moment } from 'moment';
import { BehaviorSubject, combineLatest, Observable } from 'rxjs';
import { GeneralAnswer, SkippedAnswer } from 'src/app/core/models/answer.model';
import { GeneralQuestion } from 'src/app/core/models/question.model';
import { Topic } from 'src/app/core/models/topic.models';
import { PraiseTexts } from '../praise/praises.dictionary';
import { MatDialog } from '@angular/material/dialog';
import { AssessmentService } from 'src/app/core/services/assessment.service';
import { Assessment } from 'src/app/core/models/assessment.model';
import { map } from 'rxjs/operators';
import { GenericConfirmationDialogComponent } from '../../../../../shared/components/generic-confirmation-dialog/generic-confirmation-dialog.component';
import { TopicComponent } from '../../topic.component';
import { AnswerService } from 'src/app/core/services/answer.service';

@Component({
  selector: 'app-question',
  templateUrl: './question.component.html',
  styleUrls: ['./question.component.scss']
})
export class QuestionComponent implements OnInit {
  topic: Topic;

  question: GeneralQuestion;
  questionIndex: number;
  goNextQuestion = false;
  private skipped = false;

  displayCorrectAnswer: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  // TODO Check what's that doing here ?
  answer: GeneralAnswer;

  private questionTimeStart: string;

  private dateStart: Moment;
  private assessment: Assessment;

  firstTry: boolean;
  invalidAnswersStreak = 0;

  // Shows modal confirmation before leave the page if is evaluated topic
  canDeactivate(): Observable<boolean> | boolean {
    if (this.topic.evaluated) {
      if (!this.goNextQuestion) {
        const dialogRef = this.dialog.open(GenericConfirmationDialogComponent, {
          disableClose: true,
          data: {
            title: 'exitConfirmation',
            content: 'exitInfo',
            cancelBtn: true,
            confirmBtnText: 'exit',
            confirmBtnColor: 'warn',
          }
        });
        return dialogRef.afterClosed().pipe(map(value => {
          if (value) {
            this.router.navigate([TopicComponent], {});
            this.goNextQuestion = true;
          }
          return false;
        }));
      } else {
        this.goNextQuestion = false;
        return true;
      }
    } else {
      return true;
    }
  }

  // we need to reset the answer when user navigate to previous question
  @HostListener('window:popstate', ['$event'])
    onPopState(): void {
        this.displayCorrectAnswer.next(false);
        this.answer = null;
  }

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private answerService: AnswerService,
    public dialog: MatDialog,
    private assessmentService: AssessmentService,
    private changeDetector: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    combineLatest([this.route.data, this.route.paramMap]).subscribe(
      ([data, params]: [{ topic: any }, ParamMap]) => {
        this.questionTimeStart = moment().format();

        if (data && params) {
          this.question = null;
          this.changeDetector.detectChanges();
          this.assessmentService.getAssessment(data.topic.assessment).subscribe(res => {
            this.assessment = res;
            this.isFirst(this.topic.id);
          });
          this.topic = data.topic;
          const questionId = parseInt(params.get('question_id'), 10);
          this.questionIndex = data.topic.questions.findIndex(q => q.id === questionId);
          this.question = data.topic.questions[this.questionIndex];
        }
      }
    );
  }

  submitAnswer(): void {
    if (this.answer) {
      this.skipped = false;
      this.answer.end_datetime = moment().format();
      this.answer.start_datetime = this.questionTimeStart;
      if (this.canShowFeedback()) {
        this.displayCorrectAnswer.next(true);
      } else {
        this.submitAndGoNextPage();
      }
    } else if (!this.answer && this.topic.allow_skip) {
      const dialogRef = this.dialog.open(GenericConfirmationDialogComponent, {
        disableClose: true,
        data: {
          content: 'skipSure',
          cancelBtn: true,
          confirmBtnText: 'skip',
          confirmBtnColor: 'warn',
        }
      });

      dialogRef.afterClosed().subscribe(value => {
        if (value === false) {
          dialogRef.close();
        } else if (value === true) {
          this.answer = {
            question: this.question.id,
            start_datetime: this.questionTimeStart,
            end_datetime: moment().format(),
            valid: false,
            skipped: true
          };

          this.answerService.submitAnswer(this.answer).subscribe(res => {
            this.submitAndGoNextPage();
          });
        }
    });

    } else {
      console.warn('Unexpected behaviour while submitting answer');
      this.goToNextPage();
    }
  }

  canShowFeedback(): boolean {
    // if we have feedback on 1 == SHOW_ALWAYS, or on 2 == SHOW_ON_SECOND_TRY otherwise it is NEVER
    return this.topic.show_feedback === 1 || (this.topic.show_feedback === 2 && !this.firstTry);
  }

  isFirst(topicId): any {
    return this.answerService.getCompleteStudentAnswersForTopic(topicId).subscribe(topics => {
      this.firstTry = topics.length === 0;
    });
  }

  showPraise(): void{
  // determine if we show praise or not by a 1/topic.praise chance
  const praiseProbability = Math.ceil(Math.random() * (this.topic.praise));
  const randIndex = Math.floor(Math.random() * PraiseTexts.length);
  const praise = PraiseTexts[randIndex];
  if (praiseProbability === 1) {
    const dialogRef = this.dialog.open(GenericConfirmationDialogComponent, {
      disableClose: true,
      data: {
          content: praise.text,
          confirmBtnText: 'continue',
          confirmBtnColor: 'primary',
          cancelBtn: false,
      }
      });

    dialogRef.afterClosed().subscribe(_ => {
        this.answerService.submitAnswer(this.answer).subscribe(res => {
          this.goToNextPage();
        });
      });
    } else {
      this.answerService.submitAnswer(this.answer).subscribe(res => {
        this.goToNextPage();
      });
    }
  }

  submitAndGoNextPage(): void {
    if (!this.skipped){
      this.showPraise();
    } else {
      this.answerService.submitAnswer(this.answer).subscribe(res => {
        this.goToNextPage();
      });
    }
  }

  private goToNextPage(): void {

    this.goNextQuestion = true;

    // this is to hide the correct answer feedback and display it only if the topic has show feedback activated
    // and after the user submit their answer
    this.displayCorrectAnswer.next(false);

    this.invalidAnswersStreak = (!this.topic.evaluated || (this.answer && this.answer.valid)) ? 0 : this.invalidAnswersStreak + 1;

    this.answer = null;
    this.skipped = false;

    if (this.topic.max_wrong_answers && (this.invalidAnswersStreak > this.topic.max_wrong_answers)) {

      // Get all the questions left unanswered by the student
      const questionsLeft = this.topic.questions.slice(this.questionIndex + 1);

      // For each of them send a skipped answer to the backend
      questionsLeft.forEach(question => {
        const skippedAnswer: SkippedAnswer = {
          question: question.id,
          start_datetime: moment().format(),
          end_datetime: moment().format(),
          valid: false,
          skipped: true
        };
        this.answerService.submitAnswer(skippedAnswer).subscribe();
      });

      this.router.navigate(['../../', 'completed'], { relativeTo: this.route });

      // Else, if there are unanswered questions left, navigate to the page corresponding to the question
    } else if (this.questionIndex + 1 < this.topic.questions.length) {
      const nextId = this.topic.questions[this.questionIndex + 1].id;
      this.router.navigate(['../', nextId], { relativeTo: this.route });
    } else {
      this.router.navigate(['../../', 'completed'], { relativeTo: this.route });
    }
  }
}
