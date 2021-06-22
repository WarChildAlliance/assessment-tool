import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import * as moment from 'moment';
import { Moment } from 'moment';
import { combineLatest } from 'rxjs';
import { GeneralAnswer } from 'src/app/core/models/answer.model';
import { GeneralQuestion } from 'src/app/core/models/question.model';
import { Topic } from 'src/app/core/models/topic.models';
import { AnswerService } from 'src/app/core/services/answer.service';
import { FeedbackComponent } from '../feedback/feedback.component';
import { MatDialog } from '@angular/material/dialog';
import { AssessmentService } from 'src/app/core/services/assessment.service';
import { Assessment } from 'src/app/core/models/assessment.model';

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

  private questionTimeStart: Moment;

  firstTry: boolean;
  invalidAnswersStreak = 0;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private answerService: AnswerService,
    public dialog: MatDialog,
    private assessmentService: AssessmentService,
    private changeDetector: ChangeDetectorRef
  ) { }


  ngOnInit(): void {
    combineLatest([this.route.data, this.route.paramMap]).subscribe(
      ([data, params]: [{ topic: any }, ParamMap]) => {
        this.questionTimeStart = moment();

        if (data && params) {
          this.question = null;
          this.changeDetector.detectChanges();
          this.assessmentService.getAssessment(data.topic.assessment).subscribe(res => {
            this.isFirst(this.topic.id);
          });
          this.topic = data.topic;
          const questionId = parseInt(params.get('question_id'), 10);
          this.questionIndex = data.topic.questions.findIndex(q => q.id === questionId);
          this.question = data.topic.questions[this.questionIndex];
        }
      }
    );
  }

  submitAnswer(): void {
    const duration = moment.utc(moment().diff(this.questionTimeStart)).format('HH:mm:ss');

    if (this.answer) {
      this.answer.duration = duration;
      // if we have feedback on 1 == SHOW_ALWAYS, or on 2 == SHOW_ON_SECOND_TRY
      if (this.topic.show_feedback === 1 || (this.topic.show_feedback === 2 && !this.firstTry)) {
        const dialogRef = this.dialog.open(FeedbackComponent, {
          data: { answer: this.answer, solution: this.question, valid: this.answer.valid }
        });
        dialogRef.afterClosed().subscribe(_ => {
          this.answerService.submitAnswer(this.answer).subscribe(res => {
            this.goToNextPage();
          });
        });
      } else {
        this.answerService.submitAnswer(this.answer).subscribe(res => {
          this.goToNextPage();
        });
      }
    } else if (!this.answer && this.topic.allow_skip) {

      if (confirm('Skip the question?')) {
        this.answer = {
          question: this.question.id,
          duration,
          valid: false,
          skipped: true
        };

        this.answerService.submitAnswer(this.answer).subscribe(res => {
          this.goToNextPage();
        });
      }

    } else {
      console.warn('Unexpected behaviour while submitting answer');
      this.goToNextPage();
    }
  }

  isFirst(topicId): any {
    return this.answerService.getCompleteStudentAnswersForTopic(topicId).subscribe(topics => {
      this.firstTry = topics.length === 0;
    });
  }

  private goToNextPage(): void {

    this.invalidAnswersStreak = (!this.topic.evaluated || (this.answer && this.answer.valid)) ? 0 : this.invalidAnswersStreak + 1;

    this.answer = null;

    if (this.topic.max_wrong_answers && (this.invalidAnswersStreak > this.topic.max_wrong_answers)) {
      this.router.navigate(['']);
    } else if (this.questionIndex + 1 < this.topic.questions.length) {
      const nextId = this.topic.questions[this.questionIndex + 1].id;
      this.router.navigate(['../', nextId], { relativeTo: this.route });
    } else {
      this.router.navigate(['../../', 'completed'], { relativeTo: this.route });
      // this.router.navigate(['../../../../'], { relativeTo: this.route });
    }
  }
}
