import { AfterViewInit, Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Assessment } from 'src/app/core/models/assessment.model';
import { Topic } from 'src/app/core/models/topic.models';
import { AnswerService } from 'src/app/core/services/answer.service';
import { PageNames } from 'src/app/core/utils/constants';
import { AssisstantService } from 'src/app/core/services/assisstant.service';
import { TutorialService } from 'src/app/core/services/tutorial.service';
import { TranslateService } from '@ngx-translate/core';
import { AssessmentService } from 'src/app/core/services/assessment.service';
import { combineLatest, forkJoin } from 'rxjs';
import { first } from 'rxjs/operators';

@Component({
  selector: 'app-topic',
  templateUrl: './topic.component.html',
  styleUrls: ['./topic.component.scss']
})
export class TopicComponent implements OnInit, AfterViewInit {
  topic: Topic;
  assessment: Assessment;
  firstTry: boolean;
  private readonly pageID = 'topic-page';

  public icons: any = {};

  constructor(
    private route: ActivatedRoute,
    private answerService: AnswerService,
    private tutorialSerice: TutorialService,
    private assisstantService: AssisstantService,
    public translate: TranslateService,
    public assessmentService: AssessmentService
  ) { }

  ngOnInit(): void {
    this.assisstantService.setPageID(this.pageID);
    this.route.paramMap.subscribe((params) => {
      const assessmentId = parseInt(params.get('assessment_id'), 10);
      const topicId = parseInt(params.get('topic_id'), 10);
      this.assessmentService.getAssessmentTopic(assessmentId, topicId).subscribe(
        (topic) => {
          this.topic = topic;
          this.icons.topicIcon = topic.icon;
        }
      );
      this.assessmentService.getAssessment(assessmentId).subscribe((assessment) => {
        this.icons.assessmentIcon = assessment.icon;
    });
    });
  }

  startTopic(): void {
    this.answerService.startTopicAnswer(this.topic.id).subscribe();
  }


  ngAfterViewInit(): void {
    this.tutorialSerice.currentPage.next(PageNames.topic);
  }
}
