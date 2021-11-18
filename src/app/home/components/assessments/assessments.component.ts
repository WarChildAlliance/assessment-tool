import { AfterViewInit, Component, OnInit } from '@angular/core';
import { Assessment } from 'src/app/core/models/assessment.model';
import { AssessmentService } from 'src/app/core/services/assessment.service';
import { PageNames } from 'src/app/core/utils/constants';
import { AssisstantService } from 'src/app/core/services/assisstant.service';
import { environment } from 'src/environments/environment';
import { TutorialSlideshowService } from 'src/app/core/services/tutorial-slideshow.service';

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
    private tutorialSlideshowService: TutorialSlideshowService,
    private assisstantService: AssisstantService,
  ) { }

  ngOnInit(): void {
    this.assessmentService.getAssessments().subscribe(
      assessments => {
        this.assessments = assessments;
        const tutorial = assessments.find(a => a.subject === 'TUTORIAL');
        if (tutorial && !tutorial.all_topics_complete) {
          this.tutorialSlideshowService.startTutorial();
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
  }

  getAssessmentIcon(assessment: Assessment): string {
    return assessment.icon ?
      (environment.API_URL + assessment.icon) :
      'assets/icons/flowers/purple_64.svg';
  }

}
