import { AfterViewInit, Component, OnInit } from '@angular/core';
import { Assessment } from 'src/app/core/models/assessment.model';
import { AssessmentService } from 'src/app/core/services/assessment.service';
import { PageNames } from 'src/app/core/utils/constants';
import { AssisstantService } from 'src/app/core/services/assisstant.service';
import { environment } from 'src/environments/environment';
import { TutorialService } from 'src/app/core/services/tutorial.service';
import { TutorialSlideshowService } from 'src/app/core/services/tutorial-slideshow.service';
import { CacheService } from 'src/app/core/services/cache.service';
import { MatDialog } from '@angular/material/dialog';
import { GenericConfirmationDialogComponent } from './../../../shared/components/generic-confirmation-dialog/generic-confirmation-dialog.component';

@Component({
  selector: 'app-assessments',
  templateUrl: './assessments.component.html',
  styleUrls: ['./assessments.component.scss']
})
export class AssessmentsComponent implements OnInit, AfterViewInit {

  pageName = PageNames.assessment;
  assessments: Assessment[];
  private readonly pageID = 'assessments-page';

  public displaySpinner = true;

  constructor(
    private assessmentService: AssessmentService,
    private tutorialService: TutorialService,
    private tutorialSlideshowService: TutorialSlideshowService,
    private assisstantService: AssisstantService,
    private cacheService: CacheService,
    public dialog: MatDialog,
  ) { }

  ngOnInit(): void {
    this.assessmentService.getAssessments().subscribe(
      assessments => {
        this.assessments = assessments;
        if (this.assessments.find(assessment => assessment.subject === 'POSTSEL') &&
        this.assessments.find(assessment => assessment.subject === 'POSTSEL').all_topics_complete) {
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
      }
    );
    setTimeout(x => {
      if (this.assessments) {
        this.displaySpinner = false;
      }
      this.tutorialSlideshowService.showTutorialForPage('assessments-page');
    }, 1000);

    this.assisstantService.setPageID(this.pageID);
  }

  ngAfterViewInit(): void {
    this.tutorialService.currentPage.next(this.pageName);
  }

  getAssessmentIcon(assessment: Assessment): string {
    return assessment.icon ?
      (environment.API_URL + assessment.icon) :
      'assets/icons/flowers/purple_64.svg';
  }

}
