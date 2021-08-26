import { AfterViewInit, Component, OnInit } from '@angular/core';
import { Assessment } from 'src/app/core/models/assessment.model';
import { AssessmentService } from 'src/app/core/services/assessment.service';
import { PageNames } from 'src/app/core/utils/constants';
import { AssisstantService } from 'src/app/core/services/assisstant.service';
import { environment } from 'src/environments/environment';
import { TutorialService } from 'src/app/core/services/tutorial.service';

@Component({
  selector: 'app-assessments',
  templateUrl: './assessments.component.html',
  styleUrls: ['./assessments.component.scss']
})
export class AssessmentsComponent implements OnInit, AfterViewInit {

  pageName = PageNames.assessment;
  assessments: Assessment[];
  private readonly pageID = 'assessments-page';

  constructor(
    private assessmentService: AssessmentService,
    private tutorialService: TutorialService,
    private assisstantService: AssisstantService,
  ) { }

  ngOnInit(): void {
    this.assessmentService.getAssessments().subscribe(
      assessments => {
        const tutorialCompleted = assessments.find(a => a.subject === 'TUTORIAL') ?
          assessments.find(a => a.subject === 'TUTORIAL').all_topics_complete : true;
        this.assessments = tutorialCompleted ? assessments.filter(a => a.subject !== 'TUTORIAL') : assessments.filter(a => a.subject === 'TUTORIAL');
        this.tutorialService.setCompleted(tutorialCompleted);
      }
    );
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
