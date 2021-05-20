import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import * as moment from 'moment';
import { Moment } from 'moment';
import { combineLatest } from 'rxjs';
import { GeneralAnswer } from 'src/app/core/models/answer.model';
import { GeneralQuestion } from 'src/app/core/models/question.model';
import { Topic } from 'src/app/core/models/topic.models';
import { AnswerService } from 'src/app/core/services/answer.service';

@Component({
  selector: 'app-question',
  templateUrl: './question.component.html',
  styleUrls: ['./question.component.scss']
})
export class QuestionComponent implements OnInit {
  topic: Topic;

  question: GeneralQuestion;
  questionIndex: number;

  answer: GeneralAnswer;

  private dateStart: Moment;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private answerService: AnswerService
  ) { }

  ngOnInit(): void {
    this.dateStart = moment();
    combineLatest([this.route.data, this.route.paramMap]).subscribe(
      ([data, params]: [{ topic: Topic }, ParamMap]) => {
        if (data && params) {
          this.topic = data.topic;
          const questionId = parseInt(params.get('question_id'), 10);
          this.questionIndex = data.topic.questions.findIndex(q => q.id === questionId);
          this.question = data.topic.questions[this.questionIndex];
        }
      }
    );
  }

  submitAnswer(): void {
    const duration = moment.duration(moment().diff(this.dateStart));
    if (this.answer) {
      this.answer.duration = duration.asMilliseconds();
      this.answerService.submitAnswer(this.answer).subscribe(_ => {
        this.goToNextPage();
        this.answer = null;
      });
    } else {
      this.goToNextPage();
    }
  }

  private goToNextPage(): void {
    if (this.questionIndex + 1 < this.topic.questions.length) {
      const nextId = this.topic.questions[this.questionIndex + 1].id;
      this.router.navigate(['../', nextId], { relativeTo: this.route });
    } else {
      this.router.navigate(['../../', 'completed'], { relativeTo: this.route });
      // this.router.navigate(['../../../../'], { relativeTo: this.route });
    }
  }
}
