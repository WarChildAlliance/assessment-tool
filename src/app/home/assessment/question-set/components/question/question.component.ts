import { ChangeDetectorRef, Component, HostListener, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import * as moment from 'moment';
import { Moment } from 'moment';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';
import { GeneralAnswer } from 'src/app/core/models/answer.model';
import { GeneralQuestion } from 'src/app/core/models/question.model';
import { QuestionSet } from 'src/app/core/models/question-set.models';
import { PraiseTexts } from '../praise/praises.dictionary';
import { FeedbackAudio } from '../audio-feedback/audio-feedback.dictionary';
import { MatDialog } from '@angular/material/dialog';
import { AssessmentService } from 'src/app/core/services/assessment.service';
import { Assessment } from 'src/app/core/models/assessment.model';
import { map } from 'rxjs/operators';
import { GenericConfirmationDialogComponent }
 from '../../../../../shared/components/generic-confirmation-dialog/generic-confirmation-dialog.component';
import { AnswerService } from 'src/app/core/services/answer.service';
import { TranslateService } from '@ngx-translate/core';
import { environment } from 'src/environments/environment';
import { trigger, animate, transition, style, state } from '@angular/animations';
import { UserService } from 'src/app/core/services/user.service';

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

  @ViewChild('questionNotAvailable') questionNotAvailable: TemplateRef<any>;
  @HostListener('window:popstate', ['$event'])

  public questionSet: QuestionSet;
  public isEvaluated: boolean;
  public question: GeneralQuestion;
  public questionIndex: number;
  public displayCorrectAnswer: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  public answer: GeneralAnswer;
  public dateStart: Moment;
  public assessment: Assessment;
  public previousPageUrl = '';
  public resetAnswer: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  public showTitle = false;
  // Size of the HTML elements (in px) used for the progress bar evolution
  public path = 36;
  public flyingBee = 35;
  public cursorPosition = {x:0, y:0};
  public showRightAnswerAnimation = false;

  private goNextQuestion = false;
  private show = false;
  private timeout = 250;
  private timeoutNextQuestion = 1000;
  private subscription: Subscription;
  private questionTimeStart: string;
  private titleAudio: HTMLAudioElement;
  private isTitleAudioPlaying = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private answerService: AnswerService,
    private assessmentService: AssessmentService,
    private changeDetector: ChangeDetectorRef,
    private userService: UserService,
    public translate: TranslateService,
    public dialog: MatDialog,
  ) { }

  public get stateName(): string {
    return this.show ? 'show' : 'hide';
  }

  public get isQuestionInput(): boolean {
    return this.question.question_type === 'INPUT';
  }

  @HostListener('mousemove', ['$event'])
  mouseMove($event: MouseEvent) {
    if (!this.showRightAnswerAnimation) {
      this.cursorPosition = {x: $event.clientX, y:$event.clientY};
    }
  }

  // Shows modal confirmation before leave the page if is evaluated questionSet
  // and stops question title audio if it is playing
  canDeactivate(): Observable<boolean> | boolean {
    if (this.questionSet.evaluated) {
      if (!this.goNextQuestion) {
        const dialogRef = this.dialog.open(GenericConfirmationDialogComponent, {
          disableClose: true,
          data: {
            title: 'topis.question.exitConfirmation',
            content: 'questionSets.question.exitInfo',
            cancelBtn: true,
            confirmBtnText: 'general.exit',
            confirmBtnColor: 'warn',
          }
        });
        return dialogRef.afterClosed().pipe(map(value => {
          if (value) {
            this.router.navigate(['../../../'], { relativeTo: this.route });
            this.goNextQuestion = true;
            this.answerService.endQuestionSetAnswer().subscribe();
          }
          return false;
        }));
      } else {
        if (this.isTitleAudioPlaying) {
          this.playStopTitleAudio();
        }
        this.goNextQuestion = false;
        return true;
      }
    } else {
      if (this.isTitleAudioPlaying) {
        this.playStopTitleAudio();
      }
      return true;
    }
  }

  // we need to reset the answer when user navigate to previous question
  onPopState(): void {
    this.displayCorrectAnswer.next(false);
    this.answer = null;
  }

  ngOnInit(): void {
    const tID = this.route.snapshot.paramMap.get('question_set_id') || '';
    const qID = this.route.snapshot.paramMap.get('question_id') || '';
    this.previousPageUrl = this.router.url.replace(`question-sets/${tID}/questions/${qID}`, '');

    this.userService.getUser().subscribe(({grade}) => {
      this.showTitle = +grade >= 3;
    });

    this.route.paramMap.subscribe(
      (params: ParamMap) => {
        this.questionTimeStart = moment().format();

        if (params) {
          this.question = null;
          this.changeDetector.detectChanges();

          const assessmentId = parseInt(params.get('assessment_id'), 10);
          const questionSetId = parseInt(params.get('question_set_id'), 10);
          const questionId = parseInt(params.get('question_id'), 10);

          this.assessmentService.getAssessment(assessmentId).subscribe(res => {
            this.assessment = res;
          });

          this.subscription = this.assessmentService.getAssessmentQuestionSet(assessmentId, questionSetId).subscribe(questionSet => {
            this.questionSet = questionSet;
            this.isEvaluated = questionSet.evaluated;
          });

          this.assessmentService.getAssessmentQuestionSetQuestion(assessmentId, questionSetId, questionId).subscribe(question => {
            this.question = question;
            this.questionIndex = this.questionSet.questions.findIndex(q => q.id === questionId);
            if (!this.question.title_audio) {
              return;
            }
            this.titleAudio = new Audio(this.question.title_audio);
            this.titleAudio.addEventListener('playing', () => this.isTitleAudioPlaying = true);
            this.titleAudio.addEventListener('ended', () => this.isTitleAudioPlaying = false);
            this.titleAudio.load();
            setTimeout(() => this.playStopTitleAudio(), 500);
          });

          setTimeout(x => {
            this.show = true;
          }, this.timeout);
        }
      }
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  public playStopTitleAudio(): void {
    if (!this.titleAudio) {
      return;
    }
    if (this.isTitleAudioPlaying) {
      this.titleAudio.load();
      this.isTitleAudioPlaying = false;
      return;
    }
    this.titleAudio.play();
    this.titleAudio.onended = () => {
      this.isTitleAudioPlaying = false;
    };
  }

  public submitQuestion(): void {
    if (this.answer) {
    this.answer.end_datetime = moment().format();
    this.answer.start_datetime = this.questionTimeStart;
    if (!this.isQuestionInput) {
      this.displayCorrectAnswer.next(true);
      setTimeout(() => {
        this.submitAnswerAndGoNextPage();
      }, this.timeoutNextQuestion);
    } else {
      this.submitAnswerAndGoNextPage();
      }
    } else {
      // console.warn('Unexpected behaviour while submitting answer');
      // this.goToNextPage();
    }
  }

  public checkAnswer(answerEvet): void {
    this.answer = answerEvet.answer;
    if (this.answer.valid) {
      this.showRightAnswerAnimation = true;
    }
    this.playAnswerAudioFeedback(this.answer.valid);
    setTimeout(() => {
      if (answerEvet.next) {
        this.submitQuestion();
      } else if (!this.answer.valid) {
        this.resetAnswer.next(true);
      }
      this.showRightAnswerAnimation = false;
    }, this.timeoutNextQuestion);
  }

  public submitAnswerAndGoNextPage(): void {
    if (this.answer.valid) {
      this.showPraise();
      setTimeout(() => {
        const audioProgressBar = new Audio(FeedbackAudio.progressBar);
        audioProgressBar.load();
        audioProgressBar.play();
      }, this.timeout);
    } else {
      this.answerService.submitAnswer(this.answer).subscribe(res => {
        this.goToNextPage();
      });
    }
  }

  public getSource(path: string): string{
    return environment.API_URL + path;
  }

  private onPrevious(): void {
    this.router.navigate([this.previousPageUrl]);
  }

  private showPraise(): void {
    // always showing praise
    const randIndex = Math.floor(Math.random() * PraiseTexts.length);
    const praise = PraiseTexts[randIndex];
    const dialogRef = this.dialog.open(GenericConfirmationDialogComponent, {
      disableClose: true,
      data: {
        content: praise.text,
        animation: praise.animation ?? null,
        audioURL: praise.audio,
        confirmBtnText: 'questionSets.question.continue',
        confirmBtnColor: 'primary',
        cancelBtn: false,
      }
    });

    dialogRef.afterClosed().subscribe(_ => {
      this.answerService.submitAnswer(this.answer).subscribe(res => {
        this.goToNextPage();
      });
    });
  }

  private goToNextPage(): void {

    this.goNextQuestion = true;

    // this is to hide the correct answer and display it only after the user submit their answer
    this.displayCorrectAnswer.next(false);

    this.answer = null;

    // If there are unanswered questions left, navigate to the page corresponding to the question
    if (this.questionIndex + 1 < this.questionSet.questions.length) {
      const nextId = this.questionSet.questions[this.questionIndex + 1].id;
      setTimeout(show => {
        this.show = false;
        setTimeout( navigate => {
          this.router.navigate(['../', nextId], { relativeTo: this.route });
        }, this.timeout);
      }, this.timeout);

      // Else, if all questions have been answered, closes the questionSet on the completed questionSet component
    } else {
      setTimeout(show => {
        this.show = false;
        setTimeout( navigate => {
          this.router.navigate(['../../../'], {
            relativeTo: this.route,
            queryParams: {
              recent_question_set_id: this.questionSet.id
            }
          });
        }, this.timeout);
      }, this.timeout);

    }

    this.dialog.closeAll();
  }

  private playAnswerAudioFeedback(isCorrectAnswer: boolean): void {
    const soundArr = isCorrectAnswer ? FeedbackAudio.rightAnswer : FeedbackAudio.wrongAnswer;
    const audio = new Audio(soundArr);

    audio.load();
    audio.play();
  }
}