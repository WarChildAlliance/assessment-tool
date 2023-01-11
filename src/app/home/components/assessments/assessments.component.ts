import { Component, OnDestroy, OnInit } from '@angular/core';
import { Assessment } from 'src/app/core/models/assessment.model';
import { AssessmentService } from 'src/app/core/services/assessment.service';
import { PageNames } from 'src/app/core/utils/constants';
import { environment } from 'src/environments/environment';
import { TutorialSlideshowService } from 'src/app/core/services/tutorial-slideshow.service';
import { MatDialog } from '@angular/material/dialog';
import { Subscription } from 'rxjs';
import { CacheService } from 'src/app/core/services/cache.service';
import { Router } from '@angular/router';
import { UserService } from 'src/app/core/services/user.service';
import { User } from 'src/app/core/models/user.model';

@Component({
  selector: 'app-assessments',
  templateUrl: './assessments.component.html',
  styleUrls: ['./assessments.component.scss']
})
export class AssessmentsComponent implements OnInit, OnDestroy {

  public userData: User;
  public pageName = PageNames.assessment;
  public assessments: Assessment[];
  public loading = true;

  private subscription: Subscription = new Subscription();
  private userSubscription: Subscription = new Subscription();


  constructor(
    private assessmentService: AssessmentService,
    private tutorialSlideshowService: TutorialSlideshowService,
    public dialog: MatDialog,
    private router: Router,
    private userService: UserService,
    private cacheService: CacheService
  ) {}

  ngOnInit(): void {
    this.loading = true;

    this.userSubscription = this.userService
    .getUser()
    .subscribe(async (userData) => {
      this.userData = userData;
    });

    this.subscription = this.assessmentService.getAssessments().subscribe(
      assessments => {
        this.assessments = assessments;

        this.cacheService.getData('user').then(user => {
          this.assessments.forEach(assessment => {
            assessment.complete_question_sets = 0;
            assessment.question_sets?.forEach(questionSet => {
              const cachedCompetency = (user.profile.question_sets_competencies?.find(c => c.question_set === questionSet.id))?.competency;
              if (cachedCompetency !== undefined && cachedCompetency !== null) {
                questionSet.completed = true;
                assessment.complete_question_sets++;
              } else {
                questionSet.completed = false;
              }
            });
          });
        });
        //TODO: Remove the timeout and find how to set loading as false when everything is really loaded
        if (this.loading) {
          setTimeout(() => {
              this.loading = false;
          }, 5000);
        }
      }
    );
    this.tutorialSlideshowService.showTutorialForPage('assessments-page');
  }

  public getAssessmentIcon(assessment: Assessment): string {
    return assessment.icon ?
      (environment.API_URL + assessment.icon) :
      'assets/icons/flowers/purple_64.svg';
  }

  public startAssessment(subject: string, assessmentId: string): void {
    const audio = new Audio('/assets/audios/GeneralAudio[17]enter_game.mp3');
    audio.load();
    audio.play().then(() => {
      this.router.navigate(['assessments', subject, assessmentId]);
    });
  }

  public replayIntro(): void {
    this.userService
      .updateUserNoCache({ id: this.userData.id, see_intro: true })
      .subscribe(() => {
        this.router.navigate(['/intro']);
      });
  }

  ngOnDestroy(): void{
    this.subscription.unsubscribe();
    this.userSubscription.unsubscribe();
  }

}
