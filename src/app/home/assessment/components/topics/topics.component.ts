import { AfterViewInit, Component, OnInit, ComponentFactoryResolver, ViewContainerRef } from '@angular/core';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
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
import { Assessment } from 'src/app/core/models/assessment.model';
import { slideInOutTrigger } from 'src/assets/animations/slide-in-out-trigger';

@Component({
    selector: 'app-topics',
    templateUrl: './topics.component.html',
    styleUrls: ['./topics.component.scss'],
    animations: [slideInOutTrigger]
})
export class TopicsComponent implements OnInit, AfterViewInit {
    private readonly pageID = 'topics-page';
    public currentAssessment: BehaviorSubject<number>;;
    public counter = 1;
    public assessmentIndex: number;
    public assessmentId: string;
    public assessments: Assessment[];
    public topics: Topic[];
    public assessmentTitle = '';
    public user: User = null;
    public flowersColors = ['#A67EFE', '#FE7E7E', '#55CCFF', '#5781D5', '#FFB13D', '#F23EEB'];

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
        private router: Router,
    ) {
        this.assessmentService.getAssessments().subscribe(
            assessments => {
                this.assessments = assessments;
            }
        );
    }

    assessmentSubject: string;

    ngOnInit(): void {
        // The color of the flower must be random, but never use twice the same in the same assessment
        this.flowersColors.sort(() => Math.random() - 0.5);

        this.currentAssessment = new BehaviorSubject<number>(0);

        this.cacheService.getData('user').then(user => {
            this.user = user;
            this.currentAssessment.subscribe(index => {
                this.assessmentIndex = index;
                let assessmentId = 0;
                this.assessments.forEach((assessment, index) => {
                    if (index === this.assessmentIndex) {
                        this.assessmentTitle = assessment.title;
                        assessmentId = assessment.id;
                    }
                });

                this.assessmentService.getAssessmentTopics(assessmentId).subscribe(
                    topics => {
                        topics.forEach((topic, i) => {
                            const cachedCompetency = (user.profile.topics_competencies?.find(c => c.topic === topic.id))?.competency;
                            topic.competency = [false, false, false].map((value, index) => index + 1 <= cachedCompetency);
                            const stars = topic.competency.filter((item) => item === true).length;
                            topic.ribbon = stars === 1 ? 'assets/banner_1.svg' :
                                stars === 2 ? 'assets/banner_2.svg' : stars === 3 ? 'assets/banner_3.svg' : 'assets/banner_0.svg';
                            topic.completed = (cachedCompetency !== undefined && cachedCompetency !== null) ? true : false;

                            // Students will have to finish the previous topic to unlock the next one (whether they failed or not the topic).
                            topic.can_start = i > 0 ? topics[i - 1]?.completed : true;
                        });
                        this.topics = topics;

                        this.route.queryParamMap.subscribe((params: ParamMap) => {
                            const topicsCompletionUpdate = params.get('topicsCompletionUpdate');
                            if (!topicsCompletionUpdate || topicsCompletionUpdate === 'false') {
                                return;
                            }
                            const allTopicsCompleted = topics.every((topic: Topic) => topic.completed);
                            if (allTopicsCompleted) {
                                this.showOutro();
                            }
                        });
                    }
                );
            });
        });

        this.assisstantService.setPageID(this.pageID);
        this.tutorialSlideshowService.showTutorialForPage(this.pageID);
    }

    ngAfterViewInit(): void {
        this.tutorialService.currentPage.next(PageNames.topics);
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

    public startAssessment(subject: string, assessmentId: string, assessmentIndex?: number): void {
        this.counter = this.counter === 1 ? 2 : 1;
        this.currentAssessment.next(assessmentIndex);
        this.router.navigate(['assessments', subject, assessmentId]);
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
}
