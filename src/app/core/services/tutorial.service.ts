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
  }

  createTourAssessment(): void {
    const steps: TourStep[] = [];
    steps.push({
      title: 'Welcome',
      content: 'welcome to the tour of the accessment tool',
      action: () => {this.playAudio('assets/tutorial/audio/step0.aac'); }
    });

    steps.push({
      selector: '#beeLogo',
      content: 'Here you can access your profile <img class="tutorialImg" src="assets/tutorial/images/step1.png">',
      orientation: Orientation.Bottom,
        action: () => {this.playAudio('assets/tutorial/audio/step1.aac'); },
      }
    );

    steps.push({
      selector: 'ul',
      content: 'Click here to go to an assessment <img class="tutorialImg" src="assets/tutorial/images/step2.png">',
      orientation: Orientation.Bottom,
      action: () => {this.playAudio('assets/tutorial/audio/step2.aac'); },
    });

    steps.push({
      selector: '.points-flex-container',
      content: 'See how many points you have earned so far <img class="tutorialImg" src="assets/tutorial/images/step3.png">',
      orientation: Orientation.Bottom,
      action: () => {this.playAudio('assets/tutorial/audio/step2.aac'); },
      closeAction: () => { // redirects the user for the next page where the tutorial happens
        this.router.navigate(['/assessments/7']);
      }
    });

    this.tourDict[PageNames.assessment] = this.defineTour(steps, PageNames.assessment);
  }


  createTourTopics(): void{
    const steps: TourStep[] = [];
    steps.push({
      content: 'Here the tutorial continues in a different page',
    });

    steps.push({
      selector: 'ul',
      content: 'I can highligh an HTML element in this page as well',
      orientation: Orientation.Bottom,
      closeAction: () => { // redirects the user for the next page where the tutorial happens
        this.router.navigate(['/assessments/7/topics/14']);
      }
    });

    this.tourDict[PageNames.topics] = this.defineTour(steps, PageNames.topics);
  }

  createTourTopic(): void{
    const steps: TourStep[] = [];
    steps.push({
      content: 'Here the tutorial continues in a THIRD page !!!',
    });
    steps.push({
      selector: '.start-button',
      content: 'This is the button to start answering questions',
      orientation: Orientation.Bottom
    });
    this.tourDict[PageNames.topic] = this.defineTour(steps, PageNames.topic);
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
