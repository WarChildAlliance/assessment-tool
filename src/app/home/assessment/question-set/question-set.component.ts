import { AfterViewInit, Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Assessment } from 'src/app/core/models/assessment.model';
import { QuestionSet } from 'src/app/core/models/question-set.models';
import { PageNames } from 'src/app/core/utils/constants';
import { AssisstantService } from 'src/app/core/services/assisstant.service';
import { TutorialService } from 'src/app/core/services/tutorial.service';
import { TranslateService } from '@ngx-translate/core';
import { AssessmentService } from 'src/app/core/services/assessment.service';

@Component({
  selector: 'app-question-set',
  templateUrl: './question-set.component.html',
  styleUrls: ['./question-set.component.scss']
})
export class QuestionSetComponent implements OnInit, AfterViewInit {

  public questionSet: QuestionSet;
  public assessment: Assessment;
  public firstTry: boolean;
  public icons: any = {};

  private readonly pageID = 'question-set-page';

  constructor(
    private route: ActivatedRoute,
    private tutorialSerice: TutorialService,
    private assisstantService: AssisstantService,
    public translate: TranslateService,
    public assessmentService: AssessmentService
  ) { }

  ngOnInit(): void {
    this.assisstantService.setPageID(this.pageID);
    this.route.paramMap.subscribe((params) => {
      const assessmentId = parseInt(params.get('assessment_id'), 10);
      const questionSetId = parseInt(params.get('question_set_id'), 10);
      this.assessmentService.getAssessmentQuestionSet(assessmentId, questionSetId).subscribe(
        (questionSet) => {
          this.questionSet = questionSet;
          this.icons.questionSetIcon = questionSet.icon;
        }
      );
      this.assessmentService.getAssessment(assessmentId).subscribe((assessment) => {
        this.icons.assessmentIcon = assessment.icon;
    });
    });
  }


  ngAfterViewInit(): void {
    this.tutorialSerice.currentPage.next(PageNames.questionSet);
  }
}
