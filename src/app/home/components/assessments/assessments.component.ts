import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';
import { Assessment } from 'src/app/core/models/assessment.model';
import { AssessmentService } from 'src/app/core/services/assessment.service';
import { PageNames } from 'src/app/core/utils/constants';
import { AssisstantService } from 'src/app/core/services/assisstant.service';
import { environment } from 'src/environments/environment';
import { TutorialSlideshowService } from 'src/app/core/services/tutorial-slideshow.service';
import { MatDialog } from '@angular/material/dialog';
import { GenericConfirmationDialogComponent } from './../../../shared/components/generic-confirmation-dialog/generic-confirmation-dialog.component';
import { Subscription } from 'rxjs';
import { UserService } from 'src/app/core/services/user.service';

@Component({
  selector: 'app-assessments',
  templateUrl: './assessments.component.html',
  styleUrls: ['./assessments.component.scss']
})
export class AssessmentsComponent implements OnInit, AfterViewInit, OnDestroy {

  pageName = PageNames.assessment;
  assessments: Assessment[];
  private readonly pageID = 'assessments-page';
  private subscriptionCount = 0;

  public displaySpinner = true;

  private subscription: Subscription = new Subscription();

  constructor(
    private assessmentService: AssessmentService,
    private tutorialSlideshowService: TutorialSlideshowService,
    private assisstantService: AssisstantService,
    private userService: UserService,
    public dialog: MatDialog,
  ) { }

  ngOnInit(): void {
    this.userService.getSelf().subscribe( _ => {
    });
    this.subscription.add(this.assessmentService.getAssessments().subscribe(
      assessments => {
        this.subscriptionCount++;
        this.assessments = assessments;
        const tutorial = assessments.find(a => a.subject === 'TUTORIAL');
        if (tutorial && !tutorial.all_topics_complete) {
          this.tutorialSlideshowService.startTutorial();
        }
        if (this.assessments.find(assessment => assessment.subject === 'POSTSEL') &&
          this.assessments.find(assessment => assessment.subject === 'POSTSEL').all_topics_complete &&
          this.subscriptionCount === 2) {
          this.dialog.open(GenericConfirmationDialogComponent, {
            disableClose: true,
            data: {
              title: 'hi',
              content: 'Finished post sel',
              contentType: 'translation',
              audioURL: '',
              confirmBtnText: 'OK',
              confirmBtnColor: 'primary',
            }
          });
        }
        if (this.assessments && this.subscriptionCount > 1) {
          this.displaySpinner = false;
        }
      }
    ));
    setTimeout(x => {
      this.tutorialSlideshowService.showTutorialForPage('assessments-page');
    }, 1000);

    this.assisstantService.setPageID(this.pageID);
  }

  ngAfterViewInit(): void {
  }

  getAssessmentIcon(assessment: Assessment): string {
    return assessment.icon ?
      (environment.API_URL + assessment.icon) :
      'assets/icons/flowers/purple_64.svg';
  }

  ngOnDestroy(): void{
    this.subscription.unsubscribe();
  }

}
