import { AfterViewInit, Component, OnInit, ComponentFactoryResolver, ViewContainerRef, ViewChildren, QueryList } from '@angular/core';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { BehaviorSubject, Subject, throwError } from 'rxjs';
import { switchMap, first } from 'rxjs/operators';
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

@Component({
    selector: 'app-topics',
    templateUrl: './topics.component.html',
    styleUrls: ['./topics.component.scss']
})
export class TopicsComponent implements OnInit, AfterViewInit {
    private readonly pageID = 'topics-page';
    private assessmentId: number;
    private topicsCompletionUpdate = false;

    public topics: Topic[];
    public assessmentTitle = '';
    public assessmentSubject: string;
    public user: User = null;
    public flowersColors = ['#A67EFE', '#FE7E7E', '#55CCFF', '#5781D5', '#FFB13D', '#F23EEB'];
    public showBee$ = new BehaviorSubject<boolean>(false);
    public beeState$ = new Subject<BeeState>();
    public effort = 2;

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
        private router: Router,
    ) {
    }

    ngOnInit(): void {
        // The color of the flower must be random, but never use twice the same in the same assessment
        this.flowersColors.sort(() => Math.random() - 0.5);

        this.cacheService.getData('user').then(user => {
            this.user = user;
            this.route.paramMap.pipe(
                switchMap((params: ParamMap) => {
                    this.assessmentSubject = params.get('subject');
                    if (!params.has('assessment_id')) {
                        throwError('No assessment id provided');
                    }
                    this.assessmentId = parseInt(params.get('assessment_id'), 10);
                    this.assessmentService.getAssessment(this.assessmentId).subscribe((assessment) => {
                        this.assessmentTitle = assessment.title;
                    });
                    return this.assessmentService.getAssessmentTopics(this.assessmentId);
                })
            ).subscribe(
                topics => {
                    this.route.queryParamMap.subscribe(async (params: ParamMap) => {
                        const completedTopicId = params.get('completed_topic_id');
                        if (!completedTopicId) {
                            const completedTopic = topics.find(topic => topic.id === parseInt(completedTopicId, 10));
                            if (completedTopic && !completedTopic.completed) {
                                this.topicsCompletionUpdate = true;
                                await this.registerTopicCompletion(completedTopic);
                            }
                        }
                        topics.forEach((topic, i) => {
                            const cachedCompetency = (user.profile.topics_competencies?.find(c => c.topic === topic.id))?.competency;
                            topic.competency = [false, false, false].map((value, index) => index + 1 <= cachedCompetency);
                            const stars = topic.competency.filter((item) => item === true).length;
                            topic.ribbon = stars === 1 ? 'assets/banner_1.svg' :
                                stars === 2 ? 'assets/banner_2.svg' : stars === 3 ? 'assets/banner_3.svg' : 'assets/banner_0.svg';
                            topic.completed = (cachedCompetency !== undefined && cachedCompetency !== null) ? true : false;
                            // Students will have to finish the previous topic to unlock the next one
                            // (whether they failed or not the topic).
                            topic.can_start = i > 0 ? topics[i - 1]?.completed : true;
                        });
                        setTimeout(() => {
                            this.topics = topics;

                            const allTopicsCompleted = topics.every((topic: Topic) => topic.completed);
                            if (this.topicsCompletionUpdate || !allTopicsCompleted) {
                                this.showBee$.next(true);
                                if (allTopicsCompleted) {
                                    this.showOutro();
                                }
                            }
                        }, 0);

                    });
                }
            );
        });
        this.assisstantService.setPageID(this.pageID);
        this.tutorialSlideshowService.showTutorialForPage(this.pageID);
    }

    ngAfterViewInit(): void {
        this.tutorialService.currentPage.next(PageNames.topics);
        this.showBee$.subscribe((value: boolean) => {
            if (value) {
                this.flowerComponents.changes.pipe(first()).subscribe(() => { this.setBeeStates(); });
            }
        });
    }

    private setBeeStates(allTopicsCompleted = false): void {
        if (!this.topics?.length) {
            return;
        }
        let initialIndex = this.topics.slice().reverse().findIndex(topic => topic.completed);
        initialIndex = initialIndex === -1 ? 0 : this.topics.length - 1 - initialIndex;
        // placing bee on next available topic straight away instead of triggering move if praise doesn't occur
        if (!this.topicsCompletionUpdate) {
            initialIndex += 1;
        }
        const orientation = (allTopicsCompleted && this.topicsCompletionUpdate) ? 'left' : 'right';
        const initialPos = this.flowerComponents.get(initialIndex).elementRef.nativeElement.getBoundingClientRect();
        this.beeState$.next({
            action: this.topicsCompletionUpdate ? BeeAction.PRAISE :  BeeAction.STAY,
            position: {
                x: initialPos.x,
                y: initialPos.y
            },
            orientation,
            honeypots: this.topicsCompletionUpdate ? this.effort : null
        });
        if (allTopicsCompleted) {
            this.beeState$.next({
                action: BeeAction.LEAVE,
                orientation,
            });
            return;
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
        this.router.navigate(['topics', id, 'questions', questionId], {relativeTo: this.route});
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

    private async registerTopicCompletion(topic: Topic): Promise<any> {
        const searchString = 'topic-answer';
        const response = await this.cacheService.getData(searchString);
        if (!response) {
            return;
        }
        const answers = response.answers;
        const correctAnswers = answers.filter(ans => ans.valid);
        let competency = 1;

        if (topic.evaluated) {
            let competency = Math.ceil(correctAnswers.length * 3 / answers.length);
            competency = competency === 0 ? 1 : competency;
        } else {
            competency = 0;
        }

        const user = await this.cacheService.getData('user');
        const newUser = { ...user };
        const competencies = user.profile.topics_competencies;
        const oldCompetency = (competencies?.find(competency => (competency.topic === topic.id)))?.competency;

        let newCompetency = 0;
        if (oldCompetency !== undefined) {
            newCompetency = oldCompetency < competency ? competency : oldCompetency;
        } else {
            // set new competency and effort
            newCompetency = competency;
            this.effort = 5;
        }

        newUser.profile.effort += this.effort;

        if (newUser.profile.topics_competencies.length) {
            newUser.profile.topics_competencies.forEach(element => {
                if (element.topic === topic.id) {
                    element.competency = newCompetency;
                }
            });
        }
        newUser.profile.topics_competencies.push({
            competency: newCompetency,
            topic: topic.id,
            profile: newUser.id
        });

        // update all_topics_complete if necessary
        this.cacheService.getData('assessments').then(assessments => {
            const currentAssessment = assessments.find( a => a.id = this.assessmentId);
            let allComplete = true;
            currentAssessment.topics.forEach(topic => {
                const cachedCompetency = newUser.profile.topics_competencies.find(c => c.topic === topic.id)?.competency;
                allComplete =  (cachedCompetency !== undefined && cachedCompetency !== null) ? true : false;
            });
            assessments.find(a => a.id = this.assessmentId).all_topics_complete = allComplete;
            this.cacheService.setData('assessments', assessments);
        });

        this.cacheService.setData('user', newUser);
        this.userService.updateUser(newUser);

        await this.profileService.updateProfile(newUser.profile).toPromise();

        const test = response;
        test.topic_competency = newCompetency;

        this.cacheService.setData(searchString, test);
        await this.answerService.endTopicAnswer().toPromise();
    }
}
