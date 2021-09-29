import { AfterViewInit, Component, OnInit } from '@angular/core';
import { Assessment } from 'src/app/core/models/assessment.model';
import { AssessmentService } from 'src/app/core/services/assessment.service';
import { PageNames } from 'src/app/core/utils/constants';
import { AssisstantService } from 'src/app/core/services/assisstant.service';
import { environment } from 'src/environments/environment';
import { TutorialService } from 'src/app/core/services/tutorial.service';
import { AnswerService } from 'src/app/core/services/answer.service';

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
    private assisstantService: AssisstantService,
    private answerService: AnswerService,
  ) { }

  ngOnInit(): void {
    this.assessmentService.getAssessments().subscribe(
      assessments => {
        const tutorial = assessments.find(a => a.subject === 'TUTORIAL');
        if (tutorial) {
          this.answerService.getCompleteStudentAnswersForTopic(tutorial.topics[0].id).subscribe( tutorialAnswers => {
            const tutorialCompleted = tutorialAnswers.length > 0;
            this.assessments = tutorialCompleted ? assessments.filter(a => a.subject !== 'TUTORIAL') : assessments.filter(a => a.subject === 'TUTORIAL');
            this.tutorialService.setCompleted(tutorialCompleted);
          });
        } else {
          this.tutorialService.setCompleted(true);
          this.assessments = assessments.filter(a => a.subject !== 'TUTORIAL');
        }
        this.displaySpinner = false;
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
