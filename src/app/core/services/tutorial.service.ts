import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { GuidedTour, GuidedTourService, Orientation, TourStep } from 'ngx-guided-tour';
import { BehaviorSubject } from 'rxjs';
import { PageNames } from 'src/app/core/utils/constants';
import { UserService } from './user.service';


@Injectable({
  providedIn: 'root'
})
export class TutorialService {

  private tourDict = {};
  private audio = new Audio();
  public currentPage: BehaviorSubject<string> = new BehaviorSubject<string>('');
  public hasCompleted: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(true);

  constructor(
    private guidedTourService: GuidedTourService,
    private userService: UserService,
    private router: Router,
    private translateService: TranslateService
  ) {
    this.currentPage.subscribe(pageName => {
      this.hasCompleted.subscribe( complete => {
        if (pageName in this.tourDict && !complete) {
          this.guidedTourService.startTour(this.tourDict[pageName]);
        }
      });
    });
  }

  get tutorialIsEnabled(): boolean {
    // TO DO: define how to implement this method
    //
    // This method should return true if the tutorial has to be shown to that specific user and false otherwise
    // Right now this is just a placeholder
    return true;
  }

  setCompleted(completed: boolean): void {
      this.hasCompleted.next(completed);
  }

  createAllTours(): void {
    this.translateService.setDefaultLang((this.userService.user.language.code).toLowerCase());
    this.translateService.use((this.userService.user.language.code).toLowerCase());
    this.translateService.onLangChange.subscribe(() => {
          this.createTourAssessment();
          this.createTourTopics();
          this.createTourTopic();
          this.createTourQuestionSelectGeneral();
          this.createTourQuestionNumberLineGeneral();
          this.createTourSubmitAnswer();
          this.createTourCompletedTopic();
          this.createTourProfile();
      });
  }

  createTourAssessment(): void {
    const steps: TourStep[] = [];
    steps.push({
      title: this.translateService.instant('tutorial.welcome'),
      content: this.translateService.instant('tutorial.introduction'),
      action: () => { this.playAudio('assets/tutorial/audio/TutorialBeeWelcome.ogg'); }
    });

    steps.push({
      selector: '.assessment-btn',
      content: this.translateService.instant('tutorial.startAssessment'),
      orientation: Orientation.Bottom,
      action: () => { this.playAudio('assets/tutorial/audio/TutorialStartAssessment.ogg'); }
    });

    this.tourDict[PageNames.assessment] = this.defineTour(steps, PageNames.assessment);
  }


  createTourTopics(): void {
    const steps: TourStep[] = [];
    steps.push({
      selector: '.topics-container',
      content: this.translateService.instant('tutorial.startTopic'),
      orientation: Orientation.Bottom,
      action: () => { this.playAudio('assets/tutorial/audio/TutorialStartTopic.ogg'); }
    });

    this.tourDict[PageNames.topics] = this.defineTour(steps, PageNames.topics);
  }

  createTourTopic(): void {
    const steps: TourStep[] = [];
    steps.push({
      selector: '.start-button',
      content:  this.translateService.instant('tutorial.startQuestion'),
      orientation: Orientation.Bottom,
      action: () => { this.playAudio('assets/tutorial/audio/TutorialPractiseQuestions.ogg'); }
    });
    this.tourDict[PageNames.topic] = this.defineTour(steps, PageNames.topic);
  }

  createTourQuestionSelectGeneral(): void {
    const steps: TourStep[] = [];

    steps.push({
      selector: '.question-title',
      content: this.translateService.instant('tutorial.selectQuestionTitle'),
      orientation: Orientation.Bottom,
      action: () => { this.playAudio('assets/tutorial/audio/selectQuestionTitle.ogg'); }
    });

    steps.push({
      selector: 'section',
      content: this.translateService.instant('tutorial.selectQuestionOptions'),
      orientation: Orientation.Bottom,
      action: () => { this.playAudio('assets/tutorial/audio/selectQuestionOptions.ogg'); }
    });
    this.tourDict[PageNames.questionSelect] = this.defineTour(steps, PageNames.questionSelect);
  }

  createTourQuestionNumberLineGeneral(): void {
    const steps: TourStep[] = [];

    steps.push({
      content: this.translateService.instant('tutorial.numberLineQuestionIntroduction'),
      action: () => { this.playAudio('assets/tutorial/audio/numberLineQuestionIntroduction.ogg'); }
    });

    steps.push({
      selector: '.question-title',
      content: this.translateService.instant('tutorial.numberLineQuestionTitle'),
      orientation: Orientation.Bottom,
      action: () => { this.playAudio('assets/tutorial/audio/numberLineQuestionTitle.ogg'); }
    });

    steps.push({
      selector: '.number-line',
      content: this.translateService.instant('tutorial.numberLineQuestionAnswer'),
      orientation: Orientation.Bottom,
      action: () => { this.playAudio('assets/tutorial/audio/numberLineQuestionAnswer.ogg'); }
    });

    this.tourDict[PageNames.questionNumberLine] = this.defineTour(steps, PageNames.questionNumberLine);

  }

  createTourQuestionSelectNonEvaluated(): void {
    const steps: TourStep[] = [];
  }

  createTourSubmitAnswer(): void {
    const steps: TourStep[] = [];
    steps.push({
      selector: '.main-btn',
      content: this.translateService.instant('tutorial.answerSubmit'),
      orientation: Orientation.Top,
      action: () => { this.playAudio('assets/tutorial/audio/TutorialSubmitButton.ogg'); }
    });
    steps.push({
      content: this.translateService.instant('tutorial.starsCollection'),
      action: () => { this.playAudio('assets/tutorial/audio/TutorialStars.ogg'); }
    });
    this.tourDict[PageNames.question] = this.defineTour(steps, PageNames.question);
  }

  createTourCompletedTopic(): void {
    const steps: TourStep[] = [];
    steps.push({
      content: this.translateService.instant('tutorial.honeypotCollection'),
      action: () => { this.playAudio('assets/tutorial/audio/TutorialHoneypots.ogg'); }
    });
    steps.push({
      content: this.translateService.instant('tutorial.toProfilePage'),
      action: () => { this.playAudio('assets/tutorial/audio/TutorialProfilePage.ogg'); },
      closeAction: () => { // redirects the user for the next page where the tutorial happens
        this.router.navigate(['../../../profile']);
      }
    });
    this.tourDict[PageNames.topicCompleted] = this.defineTour(steps, PageNames.topicCompleted);
  }

  createTourProfile(): void {
    const steps: TourStep[] = [];
    steps.push({
      content: this.translateService.instant('tutorial.avatarShop'),
      action: () => { this.playAudio('assets/tutorial/audio/TutorialNewCharacter.ogg'); },
    });
    steps.push({
      selector: '.avatars',
      content: this.translateService.instant('tutorial.unlockingAvatars'),
      orientation: Orientation.Top,
      action: () => { this.playAudio('assets/tutorial/audio/TutorialCollectCharacter.ogg'); },
    });
    steps.push({
      selector: '.info',
      content: this.translateService.instant('tutorial.theFriendlyBee'),
      orientation: Orientation.Bottom,
      action: () => { this.playAudio('assets/tutorial/audio/TutorialBeeClick.ogg'); },
    });
    steps.push({
      content:  this.translateService.instant('tutorial.end'),
      action: () => { this.playAudio('assets/tutorial/audio/Tutorial.ogg'); },
    });
    steps.push({
      selector: '.top-left-logo',
      orientation: Orientation.Right,
      content: this.translateService.instant('tutorial.redirection'),
      action: () => { this.playAudio('assets/tutorial/audio/TutorialTutorialEnd.ogg'); },
      closeAction: () => {
        this.setCompleted(true);
      }
    });
    this.tourDict[PageNames.profile] = this.defineTour(steps, PageNames.profile);
  }

  defineTour(steps: TourStep[], tourId: string): GuidedTour {
    const tour: GuidedTour = {
      tourId,
      steps,
      useOrb: false,
      minimumScreenSize: 320,
      resizeDialog: {
          title: 'Screen size error.',
          content: 'Please ensure your screen is large enough to display the tutorial correctly.',
    }
    };
    return tour;
  }

  playAudio(path: string): void {
    this.audio.src = path;
    if (this.translateService.currentLang === 'ara') {
        this.audio.load();
        this.audio.play();
    }
  }
}
