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
  public currentPage: BehaviorSubject<string> = new BehaviorSubject<string>('');
  public translatedTxt: string;
  public hasCompleted = false;


  constructor(
    private guidedTourService: GuidedTourService,
    private userService: UserService,
    private router: Router,
    private translateService: TranslateService
  ) {
    this.currentPage.subscribe(pageName => {
      const timeout = pageName === 'assessment' ? 3000 : 0;
      setTimeout( x => {
        if (pageName in this.tourDict && !this.hasCompleted) {
          this.guidedTourService.startTour(this.tourDict[pageName]);
        }
      }, timeout);

    });
  }

  get tutorialIsEnabled(): boolean {
    // TO DO: define how to implement this method
    //
    // This method should return true if the tutorial has to be shown to that specific user and false otherwise
    // Right now this is just a placeholder
    return true;
    return this.userService.user.first_name === 'Harry';
  }

  enableTutorial(completed: boolean): void {
    this.hasCompleted = completed;
  }

  createAllTours(): void {
    this.translateService.setDefaultLang(this.translateService.currentLang);
    this.translateService.use('eng').subscribe(
      () => {
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
      action: () => { this.playAudio('assets/tutorial/audio/step0.aac'); }
    });

    steps.push({
      selector: 'ul',
      content: this.translateService.instant('tutorial.startAssessment'),
      orientation: Orientation.Bottom,
      action: () => { this.playAudio('assets/tutorial/audio/step2.aac'); }
    });

    this.tourDict[PageNames.assessment] = this.defineTour(steps, PageNames.assessment);
  }


  createTourTopics(): void {
    const steps: TourStep[] = [];
    steps.push({
      selector: '.topics-container',
      content: this.translateService.instant('tutorial.startTopic'),
      orientation: Orientation.Bottom
    });

    this.tourDict[PageNames.topics] = this.defineTour(steps, PageNames.topics);
  }

  createTourTopic(): void {
    const steps: TourStep[] = [];
    steps.push({
      selector: '.start-button',
      content:  this.translateService.instant('tutorial.startQuestion'),
      orientation: Orientation.Top
    });
    this.tourDict[PageNames.topic] = this.defineTour(steps, PageNames.topic);
  }

  createTourQuestionSelectGeneral(): void {
    const steps: TourStep[] = [];

    steps.push({
      selector: 'h2',
      content: this.translateService.instant('tutorial.selectQuestionTitle'),
      orientation: Orientation.Bottom
    });

    steps.push({
      selector: 'section',
      content: this.translateService.instant('tutorial.selectQuestionOptions'),
      orientation: Orientation.Left
    });
    this.tourDict[PageNames.questionSelect] = this.defineTour(steps, PageNames.questionSelect);
  }

  createTourQuestionNumberLineGeneral(): void {
    const steps: TourStep[] = [];

    steps.push({
      content: this.translateService.instant('tutorial.numberLineQuestionIntroduction'),
    });

    steps.push({
      selector: 'h2',
      content: this.translateService.instant('tutorial.numberLineQuestionTitle'),
      orientation: Orientation.Bottom
    });

    steps.push({
      selector: '.number-line',
      content: this.translateService.instant('tutorial.numberLineQuestionAnswer'),
      orientation: Orientation.Bottom
    });

    this.tourDict[PageNames.questionNumberLine] = this.defineTour(steps, PageNames.questionNumberLine);


  }

  createTourQuestionSelectNonEvaluated(): void {
    const steps: TourStep[] = [];
  }

  createTourSubmitAnswer(): void {
    const steps: TourStep[] = [];
    steps.push({
      selector: '.submit-button',
      content: this.translateService.instant('tutorial.answerSubmit'),
      orientation: Orientation.Top
    });
    steps.push({
      content: this.translateService.instant('tutorial.starsCollection'),
    });
    this.tourDict[PageNames.question] = this.defineTour(steps, PageNames.question);
  }

  createTourCompletedTopic(): void {
    const steps: TourStep[] = [];
    steps.push({
      content: this.translateService.instant('tutorial.honeypotCollection'),
    });
    steps.push({
      content: this.translateService.instant('tutorial.toProfilePage'),
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
    });
    steps.push({
      selector: '.profile__avatars-shop',
      content: this.translateService.instant('tutorial.unlockingAvatars'),
      orientation: Orientation.Bottom
    });
    steps.push({
      selector: '.character',
      content: this.translateService.instant('tutorial.theFriendlyBee'),
      orientation: Orientation.Left
    });
    steps.push({
      content:  this.translateService.instant('tutorial.end')
    });
    steps.push({
      content: this.translateService.instant('tutorial.redirection'),
      closeAction: () => { // redirects the user for the next page where the tutorial happens
        this.router.navigate(['/']);
      }
    });
    this.tourDict[PageNames.profile] = this.defineTour(steps, PageNames.profile);
  }

  defineTour(steps: TourStep[], tourId: string): GuidedTour {
    const tour: GuidedTour = {
      tourId,
      steps,
      useOrb: false,
    };
    return tour;
  }

  playAudio(path: string): void {
    const audio = new Audio();
    audio.src = path;
    // audio.load();
    // audio.play();
  }
}
