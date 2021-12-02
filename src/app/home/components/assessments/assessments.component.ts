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
import { AuthService } from 'src/app/core/services/auth.service';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

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
  private userSubscription: Subscription = new Subscription();

  constructor(
    private assessmentService: AssessmentService,
    private tutorialSlideshowService: TutorialSlideshowService,
    private assisstantService: AssisstantService,
    private authService: AuthService,
    private userService: UserService,
    public dialog: MatDialog,
    private router: Router,
    private http: HttpClient,
  ) { }

  ngOnInit(): void {

    this.subscription = this.assessmentService.getAssessments().subscribe(
      assessments => {
        this.subscriptionCount++;
        this.assessments = assessments;
        const tutorial = assessments.find(a => a.subject === 'TUTORIAL');
        if (tutorial && !tutorial.all_topics_complete) {
          this.tutorialSlideshowService.startTutorial().then( x => {
            if (x) {
              this.tutorialSlideshowService.showTutorialForPage('assessments-page');
            }
          }
          );
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
    );

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
    this.userSubscription.unsubscribe();
  }

}
