import { AfterViewInit, Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Assessment } from 'src/app/core/models/assessment.model';
import { Topic } from 'src/app/core/models/topic.models';
import { AnswerService } from 'src/app/core/services/answer.service';
import { TutorialService } from 'src/app/core/services/tutorial.service';
import { PageNames } from 'src/app/core/utils/constants';

@Component({
  selector: 'app-topic',
  templateUrl: './topic.component.html',
  styleUrls: ['./topic.component.scss']
})
export class TopicComponent implements OnInit, AfterViewInit {
  topic: Topic;
  assessment: Assessment;
  firstTry: boolean;

  constructor(
    private route: ActivatedRoute,
    private answerService: AnswerService,
    private tutorialSerice: TutorialService
  ) { }

  ngOnInit(): void {
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
