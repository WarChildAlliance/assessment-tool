import { AfterViewInit, Component, OnInit } from '@angular/core';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { throwError } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { Topic } from 'src/app/core/models/topic.models';
import { AssessmentService } from 'src/app/core/services/assessment.service';
import { PageNames } from 'src/app/core/utils/constants';
import { AssisstantService } from 'src/app/core/services/assisstant.service';
import { environment } from 'src/environments/environment';
import { TutorialService } from 'src/app/core/services/tutorial.service';
import { CacheService } from 'src/app/core/services/cache.service';
import { AnswerService } from 'src/app/core/services/answer.service';
import { TutorialSlideshowService } from 'src/app/core/services/tutorial-slideshow.service';
import { User } from 'src/app/core/models/user.model';
import { FeedbackAudio } from '../../topic/components/audio-feedback/audio-feedback.dictionary';

@Component({
    selector: 'app-topics',
    templateUrl: './topics.component.html',
    styleUrls: ['./topics.component.scss']
})
export class TopicsComponent implements OnInit, AfterViewInit {
    private readonly pageID = 'topics-page';

    public topics: Topic[];
    public assessmentTitle = '';
    public user: User = null;
    public flowersColors = ['#A67EFE', '#FE7E7E', '#55CCFF', '#5781D5', '#FFB13D', '#F23EEB'];

    constructor(
        private route: ActivatedRoute,
        private assessmentService: AssessmentService,
        private answerService: AnswerService,
        private tutorialService: TutorialService,
        private assisstantService: AssisstantService,
        private router: Router,
        private cacheService: CacheService,
        private tutorialSlideshowService: TutorialSlideshowService,
    ) {
    }

    assessmentSubject: string;

    ngOnInit(): void {
        // The color of the flower must be random, but never use twice the same in the same assessment
        this.flowersColors.sort(() => Math.random() - 0.5);

        this.cacheService.getData('user').then(user => {
            this.user = user;
            this.route.paramMap.pipe(
                switchMap((params: ParamMap) => {
                    this.assessmentSubject = params.get('subject');
                    if (params.has('assessment_id')) {
                        const assessmentId = parseInt(params.get('assessment_id'), 10);
                        this.assessmentService.getAssessment(assessmentId).subscribe((assessment) => {
                            this.assessmentTitle = assessment.title;
                        });
                        return this.assessmentService.getAssessmentTopics(assessmentId);
                    }
                    throwError('No assessment id provided');
                })
            ).subscribe(
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
                }
            );
        });
        this.assisstantService.setPageID(this.pageID);
        this.tutorialSlideshowService.showTutorialForPage(this.pageID);
    }

    ngAfterViewInit(): void {
        this.tutorialService.currentPage.next(PageNames.topics);
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
}
