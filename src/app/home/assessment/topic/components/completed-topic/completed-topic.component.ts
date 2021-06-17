import { Component, OnInit } from '@angular/core';
import { AnswerService } from 'src/app/core/services/answer.service';

@Component({
  selector: 'app-completed-topic',
  templateUrl: './completed-topic.component.html',
  styleUrls: ['./completed-topic.component.scss']
})
export class CompletedTopicComponent implements OnInit {

  constructor(
    private answerService: AnswerService
  ) { }

  ngOnInit(): void {
    this.answerService.endTopicAnswer().subscribe();
  }

}
