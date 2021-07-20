import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { GuidedTour, GuidedTourService, Orientation, TourStep } from 'ngx-guided-tour';
import { BehaviorSubject } from 'rxjs';
import { PageNames } from 'src/app/core/utils/constants';
import { UserService } from './user.service';


@Injectable({
  providedIn: 'root'
})
export class TutorialService {

  private tourDict = {};
  currentPage: BehaviorSubject<string> = new BehaviorSubject<string>('');

  constructor(
    private guidedTourService: GuidedTourService,
    private userService: UserService,
    private router: Router
  ) {
    this.currentPage.subscribe( pageName => {
      if (pageName in this.tourDict && this.tutorialIsEnabled){
        this.guidedTourService.startTour(this.tourDict[pageName]);
      }
    });
  }

  get tutorialIsEnabled(): boolean{
    // TO DO: define how to implement this method
    //
    // This method should return true if the tutorial has to be shown to that specific user and false otherwise
    // Right now this is just a placeholder
    return this.userService.user.first_name === 'Harry';
  }

  createAllTours(): void {
    this.createTourAssessment();
    this.createTourTopics();
    this.createTourTopic();
    this.createTourQuestions();
    // this.createTourQuestionSelect();
  }

  createTourAssessment(): void {
    const steps: TourStep[] = [];
    steps.push({
      title: 'Welcome',
      content: 'Hello, nice to meet you. My name is Bee. In this game you will answer questions. I will fly with you and tell you what you have to do.  Let\'s get started',
      action: () => {this.playAudio('assets/tutorial/audio/step0.aac'); }
    });

    steps.push({
      selector: 'ul',
      content: 'Click the flower/button to start',
      orientation: Orientation.Bottom,
      action: () => {this.playAudio('assets/tutorial/audio/step2.aac'); },
      closeAction: () => { // redirects the user for the next page where the tutorial happens
        this.router.navigate(['/assessments/9']);
      }
    });

    this.tourDict[PageNames.assessment] = this.defineTour(steps, PageNames.assessment);
  }


  createTourTopics(): void{
    const steps: TourStep[] = [];
    steps.push({
      selector: '.topic-card',
      content: 'Click the picture',
      closeAction: () => { // redirects the user for the next page where the tutorial happens
        this.router.navigate(['/assessments/9/topics/18']);
      }
    });

    this.tourDict[PageNames.topics] = this.defineTour(steps, PageNames.topics);
  }

  createTourTopic(): void{
    const steps: TourStep[] = [];
    steps.push({
      selector: '.start-button',
      content: 'You will get some practise questions now. Click the green button',
      orientation: Orientation.Bottom
    });
    this.tourDict[PageNames.topic] = this.defineTour(steps, PageNames.topic);
  }

  createTourQuestions(): void{
    const steps: TourStep[] = [];
    steps.push({
      selector: '.submit-button',
      content: 'Press the green button to send your answer',
      orientation: Orientation.Bottom
    });
    this.tourDict[PageNames.question] = this.defineTour(steps, PageNames.topic);

  }

  createTourQuestionSelect(): void{
    const steps: TourStep[] = [];
    steps.push({
      content: 'Press the green button to send your answer',
      orientation: Orientation.Bottom
    });
    this.tourDict[PageNames.questionSelect] = this.defineTour(steps, PageNames.questionSelect);
  }

  defineTour(steps: TourStep[], tourId: string): GuidedTour{
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
