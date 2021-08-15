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
import { AuthService } from '../core/services/auth.service';
import { CacheService } from '../core/services/cache.service';
import { ProfileService } from '../core/services/profile.service';
import { UserService } from '../core/services/user.service';
import { environment } from 'src/environments/environment';
import { TranslateService } from '@ngx-translate/core';
import { TutorialService } from '../core/services/tutorial.service';

@Component({
    selector: 'app-home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit, OnDestroy {
    user: User;
    loading = true;
    competencies = [];

    private subscriptions: Subscription[] = [];

    constructor(
        private route: ActivatedRoute,
        private answerService: AnswerService,
        private assessmentService: AssessmentService,
        private authService: AuthService,
        private http: HttpClient,
        private cacheService: CacheService,
        private userService: UserService,
        private profileService: ProfileService,
        public translate: TranslateService,
        private tutorialService: TutorialService
    ) { }

    ngOnInit(): void {
        const userSubscription = this.route.data.subscribe(
            (data: { user: User }) => {
                this.user = data.user;
                this.tutorialService.createAllTours();
            }
        );

        this.cacheService.hasActiveSession().pipe(
            switchMap((hasActiveSession: boolean) => {
                if (!hasActiveSession) {
                    return this.answerService.startSession();
                }
                return EMPTY;
            })
        ).subscribe();

        const onlineSubscription = this.cacheService.networkStatus
            .subscribe((online: boolean) => {
                if (online) {
                    this.getAllData();
                    this.sendStoredMutations();
                }
            });

        this.subscriptions = [userSubscription, onlineSubscription];

        this.profileService.getAvatarsList().subscribe(avatars => {
        for (const avatar of avatars){
            this.http.get(`${environment.API_URL}` + avatar.image, {responseType: 'arraybuffer'}).subscribe();
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
                    const assessmentCompetencies = topics.map( topic  => {
                        const t: any = topic;
                        return {assessmentId : t.assessment, topicId: t.id, competency: t.competency};
                    });
                    this.competencies.push(...assessmentCompetencies);
                    this.cacheService.getData('active-user').then( user => {
                        const newUser = {...user};
                        newUser.competencies = this.competencies;
                        this.cacheService.setData('active-user', newUser);
                    });
                    for (const topic of topics) {
                        this.getAttachments(topic.attachments);
                        this.assessmentService.getAssessmentTopicWithQuestions(assessment.id, topic.id).subscribe((t: Topic) => {
                            for (const question of t.questions) {
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
            this.http.get(attachment.file, {responseType: 'arraybuffer'}).subscribe();
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

    logout(): void {
        this.userService.resetUser();
        this.authService.logout();
    }
}
