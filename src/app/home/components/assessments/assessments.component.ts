import { Component, OnDestroy, OnInit } from '@angular/core';
import { Assessment } from 'src/app/core/models/assessment.model';
import { AssessmentService } from 'src/app/core/services/assessment.service';
import { PageNames } from 'src/app/core/utils/constants';
import { AssisstantService } from 'src/app/core/services/assisstant.service';
import { environment } from 'src/environments/environment';
import { TutorialSlideshowService } from 'src/app/core/services/tutorial-slideshow.service';
import { MatDialog } from '@angular/material/dialog';
import { GenericConfirmationDialogComponent } from './../../../shared/components/generic-confirmation-dialog/generic-confirmation-dialog.component';
import { Subscription } from 'rxjs';
import { CacheService } from 'src/app/core/services/cache.service';

@Component({
  selector: 'app-assessments',
  templateUrl: './assessments.component.html',
  styleUrls: ['./assessments.component.scss']
})
export class AssessmentsComponent implements OnInit, OnDestroy {
  private readonly pageID = 'assessments-page';
  private subscriptionCount = 0;
  private subscription: Subscription = new Subscription();
  private userSubscription: Subscription = new Subscription();

  public pageName = PageNames.assessment;
  public assessments: Assessment[];

  public displaySpinner = true;


  constructor(
    private assessmentService: AssessmentService,
    private tutorialSlideshowService: TutorialSlideshowService,
    private assisstantService: AssisstantService,
    public dialog: MatDialog,
    private cacheService: CacheService
  ) {}

  ngOnInit(): void {
    const previousPageID = this.assisstantService.getPageID();

    this.subscription = this.assessmentService.getAssessments().subscribe(
      assessments => {
        this.subscriptionCount++;
        this.assessments = assessments;

        this.cacheService.getData('user').then(user => {
          this.assessments.forEach(assessment => {
            assessment.complete_topics = 0;
            assessment.topics?.forEach(topic => {
              const cachedCompetency = (user.profile.topics_competencies?.find(c => c.topic === topic.id))?.competency;
              if (cachedCompetency !== undefined && cachedCompetency !== null) {
                topic.completed = true;
                assessment.complete_topics++;
              } else {
                topic.completed = false;
              }
            });
          });
        });

        const tutorial = assessments.find(a => a.subject === 'TUTORIAL');
        if (tutorial && !tutorial.all_topics_complete) {
          this.tutorialSlideshowService.startTutorial().then(x => {
            if (x) {
              this.tutorialSlideshowService.showTutorialForPage('assessments-page');
            }
          }
          );
        }
        if (this.assessments.find(assessment => assessment.subject === 'POSTSEL') &&
          this.assessments.find(assessment => assessment.subject === 'POSTSEL').all_topics_complete &&
          this.subscriptionCount === 2 && previousPageID === 'completed-topic-page') {
          this.dialog.open(GenericConfirmationDialogComponent, {
            disableClose: true,
            data: {
              imageURL: 'icons/youDidIt.png',
              confirmBtnText: 'general.OK',
              confirmBtnColor: 'primary',
              contentType: 'translation',
              content: 'assessments.congratulations'
            }
          });
        }
        if (this.assessments && this.subscriptionCount > 1) {
          this.displaySpinner = false;
        }
      }
    );
    this.tutorialSlideshowService.showTutorialForPage('assessments-page');
    this.assisstantService.setPageID(this.pageID);
  }

  public getAssessmentIcon(assessment: Assessment): string {
    return assessment.icon ?
      (environment.API_URL + assessment.icon) :
      'assets/icons/flowers/purple_64.svg';
  }

  ngOnDestroy(): void{
    this.subscription.unsubscribe();
    this.userSubscription.unsubscribe();
  }

}
