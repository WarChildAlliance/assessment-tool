import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Topic } from 'src/app/core/models/topic.models';
import { AnswerService } from 'src/app/core/services/answer.service';

@Component({
  selector: 'app-topic',
  templateUrl: './topic.component.html',
  styleUrls: ['./topic.component.scss']
})
export class TopicComponent implements OnInit {
  topic: Topic;

  constructor(
    private route: ActivatedRoute,
    private answerService: AnswerService
  ) { }

  ngOnInit(): void {
    this.route.data.subscribe(
      (data: { topic: Topic }) => this.topic = data.topic
    );
  }

  startTopic(): void {
    this.answerService.startTopicAnswer(this.topic.id).subscribe();
  }

}
