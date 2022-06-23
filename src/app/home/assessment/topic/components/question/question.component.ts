import { ChangeDetectorRef, Component, HostListener, Inject, Input, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import * as moment from 'moment';
import { Moment } from 'moment';
import { BehaviorSubject, Observable, of, Subscription } from 'rxjs';
import { GeneralAnswer, SkippedAnswer } from 'src/app/core/models/answer.model';
import { GeneralQuestion } from 'src/app/core/models/question.model';
import { Topic } from 'src/app/core/models/topic.models';
import { PraiseTexts } from '../praise/praises.dictionary';
import { MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AssessmentService } from 'src/app/core/services/assessment.service';
import { Assessment } from 'src/app/core/models/assessment.model';
import { map } from 'rxjs/operators';
import { GenericConfirmationDialogComponent } from '../../../../../shared/components/generic-confirmation-dialog/generic-confirmation-dialog.component';
import { AnswerService } from 'src/app/core/services/answer.service';
import { TranslateService } from '@ngx-translate/core';
import { environment } from 'src/environments/environment';
import { trigger, animate, transition, style, state } from '@angular/animations';

interface DialogData {
  topicId: string;
  questionId: string;
  assessmentId: string;
}

@Component({
  selector: 'app-question',
  templateUrl: './question.component.html',
  styleUrls: ['./question.component.scss'],
  animations: [
    trigger('popOverState', [
      state('show', style({
        opacity: 1
      })),
      state('hide', style({
        opacity: 0
      })),
      transition('show => hide', animate('200ms ease-out')),
      transition('hide => show', animate('200ms ease-in'))
    ])
  ]
})

export class QuestionComponent implements OnInit, OnDestroy {
  private goNextQuestion = false;
  private isSkipped = false;
  private show = false;
  private timeout = 250;
  private subscription: Subscription;
  private questionTimeStart: string;
  private isFirstTry: boolean;
  private invalidAnswersStreak = 0;

  public topic: Topic;
  public isEvaluated: boolean;
  public question: GeneralQuestion;
  public questionIndex: number;
  public displayCorrectAnswer: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  public answer: GeneralAnswer;
  public dateStart: Moment;
  public assessment: Assessment;
  public previousPageUrl = '';

  public topicId: number;
  public questionId: number;
  public assessmentId: number;

  // Shows modal confirmation before leave the page if is evaluated topic
  canDeactivate(): Observable<boolean> | boolean {
    if (this.topic.evaluated) {
      if (!this.goNextQuestion) {
        const dialogRef = this.dialog.open(GenericConfirmationDialogComponent, {
          disableClose: true,
          data: {
            title: 'topis.question.exitConfirmation',
            content: 'topics.question.exitInfo',
            cancelBtn: true,
            confirmBtnText: 'general.exit',
            confirmBtnColor: 'warn',
          }
        });
        return dialogRef.afterClosed().pipe(map(value => {
          if (value) {
            this.router.navigate(['../../../'], { relativeTo: this.route });
            this.goNextQuestion = true;
            this.answerService.endTopicAnswer().subscribe();
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
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
    private route: ActivatedRoute,
    private router: Router,
    private answerService: AnswerService,
    public dialog: MatDialog,
    private assessmentService: AssessmentService,
    private changeDetector: ChangeDetectorRef,
    public translate: TranslateService
  ) {
    if (this.data) {
      console.log('this.data', this.data);
      this.topicId = parseInt(this.data.topicId, 10);
      this.questionId = parseInt(this.data.questionId, 10);
      this.assessmentId = parseInt(this.data.assessmentId, 10);
    }
  }

  ngOnInit(): void {
    console.log('topicId - questionId - assessmentId', this.topicId, this.questionId, this.assessmentId);
    const tID = this.route.snapshot.paramMap.get('topic_id') || this.topicId;
    const qID = this.route.snapshot.paramMap.get('question_id') || this.questionId;
    this.previousPageUrl = this.router.url.replace(`topics/${tID}/questions/${qID}`, '');

    this.assessmentService.getAssessment(this.assessmentId).subscribe(res => {
      console.log('1 res', res);
      this.assessment = res;
    });

    this.subscription = this.assessmentService.getAssessmentTopic(this.assessmentId, this.topicId).subscribe(topic => {
      console.log('2 topic', topic);

      this.topic = topic;
      this.isEvaluated = topic.evaluated;
      this.isFirst(this.topic.id);
    });

    this.assessmentService.getAssessmentTopicQuestion(this.assessmentId, this.topicId, this.questionId).subscribe(question => {
      console.log('3 question', question);

      this.question = question;
      this.questionIndex = this.topic.questions.findIndex(q => q.id === this.questionId);
    });

    // this.route.paramMap.subscribe(
    //   (params: ParamMap) => {
    //     this.questionTimeStart = moment().format();

    //     if (params) {
    //       this.question = null;
    //       this.changeDetector.detectChanges();

    //       const assessmentId = parseInt(params.get('assessment_id'), 10);
    //       const topicId = parseInt(params.get('topic_id'), 10);
    //       const questionId = parseInt(params.get('question_id'), 10);

    //       this.assessmentService.getAssessment(assessmentId).subscribe(res => {
    //         this.assessment = res;
    //       });

    //       this.subscription = this.assessmentService.getAssessmentTopic(assessmentId, topicId).subscribe(topic => {
    //         this.topic = topic;
    //         this.isEvaluated = topic.evaluated;
    //         this.isFirst(this.topic.id);
    //       });

    //       this.assessmentService.getAssessmentTopicQuestion(assessmentId, topicId, questionId).subscribe(question => {
    //         this.question = question;
    //         this.questionIndex = this.topic.questions.findIndex(q => q.id === questionId);
    //       });

    //       setTimeout(x => {
    //         this.show = true;
    //       }, this.timeout);
    //     }
    //   }
    // );

    console.log('A QUESTÃO', this.question);
  }

  private onPrevious(): void {
    this.router.navigate([this.previousPageUrl]);
  }

  private canShowFeedback(): boolean {
    // if we have feedback on 1 == SHOW_ALWAYS, or on 2 == SHOW_ON_SECOND_TRY otherwise it is NEVER
    return this.topic.show_feedback === 1 || (this.topic.show_feedback === 2 && !this.isFirstTry);
  }

  private isFirst(topicId): any {
    return this.answerService.getCompleteStudentAnswersForTopic(topicId).subscribe(topics => {
      this.isFirstTry = topics.length === 0;
    });
  }

  private showPraise(): void {
    // determine if we show praise or not by a 1/topic.praise chance
    const praiseProbability = Math.ceil(Math.random() * (this.topic.praise));
    const randIndex = Math.floor(Math.random() * PraiseTexts.length);
    const praise = PraiseTexts[randIndex];
    if (praiseProbability === 1) {
      const dialogRef = this.dialog.open(GenericConfirmationDialogComponent, {
        disableClose: true,
        data: {
          content: praise.text,
          animation: praise.animation ?? null,
          audioURL: praise.audio,
          confirmBtnText: 'topics.question.continue',
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

  private goToNextPage(): void {

    this.goNextQuestion = true;

    // this is to hide the correct answer feedback and display it only if the topic has show feedback activated
    // and after the user submit their answer
    this.displayCorrectAnswer.next(false);

    // Holds the number of successive invalid answers
    this.invalidAnswersStreak = (!this.topic.evaluated || (this.answer && this.answer.valid)) ? 0 : this.invalidAnswersStreak + 1;

    this.answer = null;

    // If the maximum number of invalid answers has been reached
    if (this.topic.max_wrong_answers && (this.invalidAnswersStreak >= this.topic.max_wrong_answers)) {

      // Get all the questions left unanswered by the student
      const questionsLeft = this.topic.questions.slice(this.questionIndex + 1);
      this.setQuestions(questionsLeft).then( _ => {
        setTimeout(show => {
          this.show = false;
          setTimeout( navigate => {
            this.router.navigate(['../../', 'completed'], { relativeTo: this.route });
          }, this.timeout);
        }, this.timeout);
      });

      // Else, if there are unanswered questions left, navigate to the page corresponding to the question
    } else if (this.questionIndex + 1 < this.topic.questions.length) {
      const nextId = this.topic.questions[this.questionIndex + 1].id;
      setTimeout(show => {
        this.show = false;
        setTimeout( navigate => {
          this.router.navigate(['../', nextId], { relativeTo: this.route });
        }, this.timeout);
      }, this.timeout);

      // Else, if all questions have been answered, closes the topic on the completed topic component
    } else {
      setTimeout(show => {
        this.show = false;
        setTimeout( navigate => {
          this.router.navigate(['../../', 'completed'], { relativeTo: this.route });
        }, this.timeout);
      }, this.timeout);

    }
  }

  private async setQuestions(leftQuestions): Promise<void>{
    for (const question of leftQuestions) {
      const skippedAnswer: SkippedAnswer = {
        question: question.id,
        start_datetime: moment().format(),
        end_datetime: moment().format(),
        valid: false,
        skipped: true
      };
      await new Promise ((resolve, reject) => {
          this.answerService.submitAnswer(skippedAnswer)
              .subscribe(location => {
                  resolve(true);
               });
      });
    }
  }

  public submitSkipQuestion(): void {
    if (this.answer) {
      this.isSkipped = false;
      this.answer.end_datetime = moment().format();
      this.answer.start_datetime = this.questionTimeStart;
      if (this.canShowFeedback()) {
        this.displayCorrectAnswer.next(true);
      } else {
        this.submitAnswerAndGoNextPage();
      }
    } else if (!this.answer && this.topic.allow_skip) {
      const dialogRef = this.dialog.open(GenericConfirmationDialogComponent, {
        disableClose: true,
        data: {
          content: 'topics.question.skipSure',
          cancelBtn: true,
          confirmBtnText: 'general.skip',
          confirmBtnColor: 'warn',
        }
      });

      dialogRef.afterClosed().subscribe(value => {
        if (value === false) {
          dialogRef.close();
        } else if (value === true) {
          this.isSkipped = true;

          this.answer = {
            question: this.question.id,
            start_datetime: this.questionTimeStart,
            end_datetime: moment().format(),
            valid: false,
            skipped: true
          };

          this.submitAnswerAndGoNextPage();
        }
      });

    } else {
      // console.warn('Unexpected behaviour while submitting answer');
      // this.goToNextPage();
    }
  }

  public submitAnswerAndGoNextPage(): void {
    if (!this.isSkipped && this.answer.valid) {
      this.showPraise();
    } else {
      this.answerService.submitAnswer(this.answer).subscribe(res => {
        this.goToNextPage();
      });
    }
  }

  public getSource(path: string): string{
    return environment.API_URL + path;
  }

  public get stateName(): string {
    return this.show ? 'show' : 'hide';
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

}
