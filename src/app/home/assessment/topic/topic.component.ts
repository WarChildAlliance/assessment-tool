import { AfterViewInit, Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Assessment } from 'src/app/core/models/assessment.model';
import { Topic } from 'src/app/core/models/topic.models';
import { AnswerService } from 'src/app/core/services/answer.service';
import { TutorialService } from 'src/app/core/services/tutorial.service';
import { PageNames } from 'src/app/core/utils/constants';
import { AssisstantService } from 'src/app/core/services/assisstant.service';

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

  constructor(
    private route: ActivatedRoute,
    private answerService: AnswerService,
    private tutorialSerice: TutorialService,
    private assisstantService: AssisstantService,
  ) { }

  ngOnInit(): void {
    this.assisstantService.setPageID(this.pageID);
    this.route.data.subscribe(
      (data: { topic: Topic}) => {
        this.topic = data.topic;
      }
    );
  }

  startTopic(): void {
    this.answerService.startTopicAnswer(this.topic.id).subscribe();
  }


  ngAfterViewInit(): void {
    this.tutorialSerice.currentPage.next(PageNames.topic);
  }
}
