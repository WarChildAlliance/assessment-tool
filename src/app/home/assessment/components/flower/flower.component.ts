import { Component, Input, OnInit, ElementRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { lighten } from 'polished';
import { Assessment } from 'src/app/core/models/assessment.model';
import { QuestionSet } from 'src/app/core/models/question-set.models';
import { User } from 'src/app/core/models/user.model';
import { AnswerService } from 'src/app/core/services/answer.service';
import { UserService } from 'src/app/core/services/user.service';
import { environment } from 'src/environments/environment';
import { FeedbackAudio } from '../../question-set/components/audio-feedback/audio-feedback.dictionary';
import { ProgressionAudio } from '../audio-progression/audio-progression.dictionary';

@Component({
  selector: 'app-flower',
  templateUrl: './flower.component.html',
  styleUrls: ['./flower.component.scss'],
})
export class FlowerComponent implements OnInit {

  @Input() index: number;
  @Input() flowerColor: string;
  @Input() assessment: Assessment;

  public flowerColorLighter: string;
  public fadeCorollaIn = false;
  public fadeHoneypotsIn = false;

  private currentQuestionSet: QuestionSet;
  private user: User;

  constructor(
    public elementRef: ElementRef,
    private route: ActivatedRoute,
    private router: Router,
    private answerService: AnswerService,
    private userService: UserService
  ) {}

  public get questionSet(): QuestionSet { return this.currentQuestionSet; }

  @Input()
  set questionSet(questionSet: QuestionSet) {
    if (questionSet.can_start && this.currentQuestionSet && !this.currentQuestionSet.can_start) {
      this.fadeCorollaIn = true;
    }
    if (questionSet.completed && this.currentQuestionSet && !this.currentQuestionSet.completed) {
      this.fadeHoneypotsIn = true;
      this.playShowHoneypotsAudio(questionSet.honeypots);
    }
    this.currentQuestionSet = questionSet;
  }

  ngOnInit(): void {
    this.flowerColorLighter = lighten(0.25, this.flowerColor);
    this.userService.currentUser.subscribe((user) => {
      this.user = user;
    });
  }

  public playLockedQuestionSetAudioFeedback(questionSetIndex: number): void {
    const questionSetElement = document.getElementById(
      'question-set-' + questionSetIndex.toString()
    ) as HTMLElement;
    questionSetElement.classList.add('vibration');
    setTimeout(() => {
      questionSetElement.classList.remove('vibration');
    }, 500);
    // TODO: change to angry bee sound when available
    const sound = FeedbackAudio.wrongAnswer[0];
    const audio = new Audio(sound);
    audio.load();
    audio.play();
  }

  public getQuestionSetIcon(): string {
    return this.questionSet.icon
      ? environment.API_URL + this.questionSet.icon
      : 'assets/yellow_circle.svg';
  }

  public async startQuestionSet(): Promise<void> {

    const questionId = this.questionSet.questions[0].id;
    const skipIntro = this.user.skip_intro_for_assessments?.includes(this.assessment.id);
    this.answerService.startQuestionSetAnswer(this.questionSet.id).subscribe();
    if (!skipIntro && this.index === 0 && (this.assessment?.subject === 'MATH' || this.assessment?.subject === 'LITERACY')) {
      this.router.navigate(['question-sets', this.questionSet.id, 'intro'], {
        relativeTo: this.route,
        queryParams: {
            assessment_id: this.assessment?.id,
            subject: this.assessment?.subject,
            question_id: questionId
        }
      });
    } else {
      this.router.navigate(['question-sets', this.questionSet.id, 'questions', questionId], {
        relativeTo: this.route,
      });
    }
  }

  private playShowHoneypotsAudio(honeypotsNbr: number): void {
    const sound = new Audio(ProgressionAudio.showHoneypots);
    sound.load();
    sound.play().then(() => {
      setTimeout(() => {
        if (honeypotsNbr > 1) {
          this.playShowHoneypotsAudio(honeypotsNbr - 1);
        }
      }, 500);
    });
  }
}
