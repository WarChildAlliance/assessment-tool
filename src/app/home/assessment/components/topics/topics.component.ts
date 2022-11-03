import { AfterViewInit, Component, OnInit, ComponentFactoryResolver, ViewContainerRef, ViewChildren, QueryList } from '@angular/core';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { BehaviorSubject, Subject, of, EMPTY } from 'rxjs';
import { switchMap, take, map } from 'rxjs/operators';
import { Topic } from 'src/app/core/models/topic.models';
import { AssessmentService } from 'src/app/core/services/assessment.service';
import { PageNames } from 'src/app/core/utils/constants';
import { AssisstantService } from 'src/app/core/services/assisstant.service';
import { environment } from 'src/environments/environment';
import { TutorialService } from 'src/app/core/services/tutorial.service';
import { CacheService } from 'src/app/core/services/cache.service';
import { TutorialSlideshowService } from 'src/app/core/services/tutorial-slideshow.service';
import { User } from 'src/app/core/models/user.model';
import { FeedbackAudio } from '../../topic/components/audio-feedback/audio-feedback.dictionary';
import { OutroComponent } from '../outro/outro.component';
import { AnswerService } from 'src/app/core/services/answer.service';
import { UserService } from 'src/app/core/services/user.service';
import { ProfileService } from 'src/app/core/services/profile.service';
import { FlowerComponent } from '../flower/flower.component';
import { BeeState, BeeAction } from '../bee/bee.component';
import { Assessment } from 'src/app/core/models/assessment.model';
import { SwiperOptions } from 'swiper';

@Component({
    selector: 'app-topics',
    templateUrl: './topics.component.html',
    styleUrls: ['./topics.component.scss']
})
export class TopicsComponent implements OnInit, AfterViewInit {
    private readonly pageID = 'topics-page';
    private assessmentId: number;
    private topicsCompletionUpdate = false;
    private allAssessmentTopicsCompleted = false;
    private effort = 2;

    public onSlideChange;
    public assessments: Assessment[];
    public topics: Topic[] = [];
    public assessmentTitle = '';
    public assessmentSubject: string;
    public user: User = null;
    public flowersColors = ['#A67EFE', '#FE7E7E', '#55CCFF', '#5781D5', '#FFB13D', '#F23EEB'];
    public config: SwiperOptions;
    public showBee$ = new BehaviorSubject<boolean>(false);
    public beeState$ = new Subject<BeeState>();
    public canShowAssessments = false;

    @ViewChildren('flowerComponent')
    public flowerComponents: QueryList<FlowerComponent>;

    constructor(
        private route: ActivatedRoute,
        private componentFactoryResolver: ComponentFactoryResolver,
        private viewContainerRef: ViewContainerRef,
        private assessmentService: AssessmentService,
        private tutorialService: TutorialService,
        private assisstantService: AssisstantService,
        private cacheService: CacheService,
        private tutorialSlideshowService: TutorialSlideshowService,
        private answerService: AnswerService,
        private profileService: ProfileService,
        private userService: UserService,
        private router: Router
    ) {
        const audio = new Audio('/assets/audios/swipingAssessmentsLeft-Right.mp3');
        audio.load();

        this.onSlideChange = (event?: any) => {
            audio.play();
            this.assessmentId = this.assessments[event.activeIndex].id;
        };

        this.config = {
            pagination: { el: '.swiper-pagination', clickable: true },
            navigation: {
                nextEl: '.swiper-button-next',
                prevEl: '.swiper-button-prev'
            },
            spaceBetween: 30,
            on: { slideChange: this.onSlideChange }
        };
    }

    ngOnInit(): void {
        // The color of the flower must be random, but never use twice the same in the same assessment
        this.flowersColors.sort(() => Math.random() - 0.5);

        this.cacheService.getData('user').then(user => {
            this.user = user;

            this.assessmentService.getAssessments().pipe(
                map((assessments: Assessment[]) => {
                    // if no assessments, interrupt pipe and subsequent callback
                    if (!assessments?.length) {
                        return EMPTY;
                    }
                    this.assessmentId = assessments[0].id;
                    assessments.forEach((assessment, i) => {
                        if (i === 0) {
                            this.topics = assessment.topics;
                        }
                        assessment.topics.forEach((topic, j) => {
                            this.setTopicProperties(assessments[0], topic, j);
                        });
                    });
                    this.assessments = assessments;
                    return assessments;
                }),
                switchMap(() => this.route.queryParamMap.pipe(
                    map((queryParams: ParamMap) => {
                        const recentTopicId = queryParams.get('recent_topic_id');
                        if (!recentTopicId) {
                            return null;
                        }
                        const recentTopic = this.topics.find(topic => topic.id === parseInt(recentTopicId, 10));
                        if (recentTopic && !recentTopic.completed) {
                            this.topicsCompletionUpdate = true;
                            return recentTopic;
                        }
                        return null;
                    }),
                    switchMap((completedTopic: Topic) =>
                        completedTopic ? this.registerTopicCompletion(completedTopic, user).then(() => completedTopic.id) :
                        of(null)),
                    )
                )
            ).subscribe((completedTopicId: number | null) => {
                if (completedTopicId) {
                    this.setTopicProperties(
                        this.assessments.find(e => e.id === this.assessmentId),
                        this.topics.find(e => e.id === completedTopicId),
                        this.topics.findIndex(e => e.id === completedTopicId)
                    );
                }
                this.canShowAssessments = true;
                this.allAssessmentTopicsCompleted = this.topics.every((topic: Topic) => topic.completed);
                if (this.topicsCompletionUpdate || !this.allAssessmentTopicsCompleted) {
                    this.showBee$.next(true);
                    if (this.allAssessmentTopicsCompleted) {
                        this.showOutro();
                    }
                }
            });
        });
        this.assisstantService.setPageID(this.pageID);
        this.tutorialSlideshowService.showTutorialForPage(this.pageID);
    }

    ngAfterViewInit(): void {
        this.tutorialService.currentPage.next(PageNames.topics);
        this.showBee$.subscribe((value: boolean) => {
            if (!value) { return; }
            if (this.flowerComponents?.length) {
                this.setAnimations();
            } else {
                this.flowerComponents.changes.pipe(take(1)).subscribe(() => {
                    this.setAnimations();
                });
            }
        });
    }

    private setTopicProperties(assessment: Assessment, topic: Topic, topicIndex: number): void {
        const cachedCompetency = (this.user.profile.topics_competencies?.find(
            c => c.topic === topic.id && topic.assessment === assessment.id
        ))?.competency;
        topic.competency = [false, false, false].map(
            (value, index) => index + 1 <= cachedCompetency
        );
        const stars = topic.competency.filter((item) => item === true).length;
        topic.ribbon = stars === 1 ? 'assets/banner_1.svg' :
            stars === 2 ? 'assets/banner_2.svg' : stars === 3 ? 'assets/banner_3.svg' : 'assets/banner_0.svg';
        topic.completed = (cachedCompetency !== undefined && cachedCompetency !== null) ? true : false;

        // Students will have to finish the previous topic to unlock the next one
        // (whether they failed or not the topic)
        topic.can_start = topicIndex > 0 ? assessment.topics[topicIndex - 1]?.completed : true;
    }

    private setAnimations(): void {
        if (!this.topics?.length) {
            return;
        }
        let initialIndex = this.topics.slice().reverse().findIndex(topic => topic.completed);
        initialIndex = initialIndex === -1 ? 0 : this.topics.length - 1 - initialIndex;
        // placing bee on next available topic straight away instead of triggering move if praise doesn't occur
        if (!this.topicsCompletionUpdate && initialIndex !== 0) {
            initialIndex += 1;
        }
        const orientation = (this.allAssessmentTopicsCompleted && this.topicsCompletionUpdate) ? 'left' : 'right';
        const initialPos = this.flowerComponents.get(initialIndex).elementRef.nativeElement.getBoundingClientRect();
        this.beeState$.next({
            action: this.topicsCompletionUpdate ? BeeAction.PRAISE : BeeAction.STAY,
            position: {
                x: initialPos.x,
                y: initialPos.y
            },
            orientation,
            honeypots: this.topicsCompletionUpdate ? this.effort : null
        });
        if (this.topicsCompletionUpdate) {
            if (this.allAssessmentTopicsCompleted) {
                this.beeState$.next({
                    action: BeeAction.MOVE,
                    position: {
                        x: -100,
                        y: 50
                    },
                    orientation,
                });
                return;
            } else {
                this.beeState$.next({
                    action: BeeAction.STAY,
                    position: {
                        x: initialPos.x,
                        y: initialPos.y
                    },
                    orientation,
                });
            }
        }
        if (!this.topics[initialIndex]?.completed) { return; }
        const nextPos = this.flowerComponents.get(initialIndex + 1).elementRef.nativeElement.getBoundingClientRect();
        this.beeState$.next({
            action: BeeAction.MOVE,
            position: {
                x: nextPos.x,
                y: nextPos.y
            },
            orientation
        });
    }

    private showOutro(): void {
        const factory = this.componentFactoryResolver.resolveComponentFactory(OutroComponent);
        const componentRef = this.viewContainerRef.createComponent(factory);
        (componentRef.instance as OutroComponent).outroComplete.subscribe(() => {
            this.viewContainerRef.clear();
        });
    }

    public getTopicIcon(topic: Topic): string {
        return topic.icon ?
            (environment.API_URL + topic.icon) :
            'assets/yellow_circle.svg';
    }

    public async startTopic(id: number): Promise<void> {
        const selectedTopic = this.topics.find(topic => topic.id === id);
        if (selectedTopic.has_sel_question) {
            // If has SEL questions and isn't the student first try: filter questions to remove SEL quedtions
            if (await this.isNotFirstTry(id)) {
                this.topics.forEach(topic => {
                    topic.questions = topic.questions?.filter(question => question.question_type !== 'SEL');
                });
            }
        }

        const questionId = selectedTopic.questions[0].id;
        this.answerService.startTopicAnswer(id).subscribe();
        this.router.navigate(['topics', id, 'questions', questionId], { relativeTo: this.route });
    }

    private async isNotFirstTry(topicId: number): Promise<boolean> {
        const answers = await this.answerService.getCompleteStudentAnswersForTopic(topicId).toPromise();
        return answers.length > 0;
    }

    public playLockedTopicAudioFeedback(topicIndex: number): void {
        const topicElement = document.getElementById('topic-' + topicIndex.toString()) as HTMLElement;
        topicElement.classList.add('vibration');
        setTimeout(() => {
            topicElement.classList.remove('vibration');
        }, 500);
        // TODO: change to angry bee sound when available
        const sound = FeedbackAudio.wrongAnswer[0];
        const audio = new Audio(sound);
        audio.load();
        audio.play();
    }

    private async registerTopicCompletion(topic: Topic, user: any): Promise<any> {
        const searchString = 'topic-answer';
        const response = await this.cacheService.getData(searchString);
        if (!response) { return; }
        const answers = response.answers;
        const correctAnswers = answers.filter(ans => ans.valid);
        let competency = 1;

        if (topic.evaluated) {
            competency = Math.ceil(correctAnswers.length * 3 / answers.length);
            competency = competency === 0 ? 1 : competency;
        } else {
            competency = 0;
        }
        const competencies = user.profile.topics_competencies;
        const oldCompetency = (competencies?.find(cmp => (cmp.topic === topic.id)))?.competency;

        let newCompetency = 0;
        if (oldCompetency !== undefined) {
            newCompetency = oldCompetency < competency ? competency : oldCompetency;
        } else {
            // set new competency and effort
            newCompetency = competency;
            this.effort = 5;
        }

        user.profile.effort += this.effort;

        if (user.profile.topics_competencies.length) {
            user.profile.topics_competencies.forEach(element => {
                if (element.topic === topic.id) {
                    element.competency = newCompetency;
                }
            });
        }
        user.profile.topics_competencies.push({
            competency: newCompetency,
            topic: topic.id,
            profile: user.id
        });

        // update all_topics_complete if necessary
        this.cacheService.getData('assessments').then(assessments => {
            const currentAssessment = assessments.find( a => a.id = this.assessmentId);
            let allComplete = true;
            currentAssessment.topics.forEach(currentTopic => {
                const cachedCompetency = user.profile.topics_competencies.find(c => c.topic === currentTopic.id)?.competency;
                allComplete =  (cachedCompetency !== undefined && cachedCompetency !== null) ? true : false;
            });
            assessments.find(a => a.id = this.assessmentId).all_topics_complete = allComplete;
            this.cacheService.setData('assessments', assessments);
        });

        this.cacheService.setData('user', user);
        this.userService.updateUser(user);

        this.profileService.updateProfile(user.profile).subscribe();

        const test = response;
        test.topic_competency = newCompetency;

        this.cacheService.setData(searchString, test);
        this.answerService.endTopicAnswer().subscribe();
    }
}
