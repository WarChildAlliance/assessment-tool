import { HttpClient, HttpRequest } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { EMPTY, from, Observable, Subscription } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { Assessment } from '../core/models/assessment.model';
import { Attachment } from '../core/models/attachment.model';
import { QuestionSelect, QuestionSort } from '../core/models/question.model';
import { Topic } from '../core/models/topic.models';
import { User } from '../core/models/user.model';
import { AnswerService } from '../core/services/answer.service';
import { AssessmentService } from '../core/services/assessment.service';
import { CacheService } from '../core/services/cache.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit, OnDestroy {
  user: User;

  private subscriptions: Subscription[] = [];

  constructor(
    private route: ActivatedRoute,
    private answerService: AnswerService,
    private assessmentService: AssessmentService,
    private http: HttpClient,
    private cacheService: CacheService
  ) { }

  ngOnInit(): void {
    const userSubscription = this.route.data.subscribe(
      (data: { user: User }) => this.user = data.user
    );

    this.answerService.hasActiveSession().pipe(
      switchMap((hasActiveSession: boolean) => {
        if (!hasActiveSession) {
          return this.answerService.startSession();
        }
        return EMPTY;
      })
    ).subscribe();

    const onlineSubscription = this.cacheService.networkStatus.subscribe((online: boolean) => {
      if (online) {
        this.getAllData();
        this.sendStoredMutations();
      }
    });

    this.subscriptions = [userSubscription, onlineSubscription];
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  private getAllData(): void {
    this.assessmentService.getAssessments().subscribe((assessments: Assessment[]) => {
      for (const assessment of assessments) {
        this.assessmentService.getAssessmentTopics(assessment.id).subscribe((topics: Topic[]) => {
          for (const topic of topics) {
            this.getAttachments(topic.attachments);
            this.assessmentService.getAssessmentTopicWithQuestions(assessment.id, topic.id).subscribe((topic: Topic) => {
              for (const question of topic.questions) {
                let attachments = question.attachments || [];
                if (question.question_type === 'SORT' || question.question_type === 'SELECT') {
                  for (const option of (question as QuestionSort | QuestionSelect).options) {
                    attachments = attachments.concat(option.attachments);
                  }
                }
                if (question.hint) {
                  attachments = attachments.concat(question.hint.attachments);
                }
                this.getAttachments(attachments);
              }
            });
          }
        });
      }
    });
  }

  private getAttachments(attachments: Attachment[]): void {
    if (!attachments || !attachments.length) {
      return;
    }

    for (const attachment of attachments) {
      // TODO: Fix CORS error to successfully get the attachments
      this.http.get(attachment.link).subscribe();
    }
  }

  private sendStoredMutations(): void {
    from(this.cacheService.getRequests()).subscribe((requests: { key: number, value: HttpRequest<unknown> }[]) => {
      for (const request of requests) {
        let requestToSend: Observable<any> = null;
        if (request.value.method === 'POST') {
          requestToSend = this.http.post(request.value.urlWithParams, request.value.body);
        } else if (request.value.method === 'PUT') {
          requestToSend = this.http.put(request.value.urlWithParams, request.value.body);
        } else if (request.value.method === 'DELETE') {
          requestToSend = this.http.delete(request.value.urlWithParams);
        }

        if (requestToSend) {
          requestToSend.subscribe((_) => {
            this.cacheService.deleteRequest(request.key);
          });
        }
      }
    });
  }
}
