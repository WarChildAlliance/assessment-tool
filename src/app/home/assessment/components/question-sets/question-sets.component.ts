import { AfterViewInit, Component, OnInit, ComponentFactoryResolver, ViewContainerRef, ViewChildren, QueryList } from '@angular/core';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { BehaviorSubject, Subject, of, EMPTY } from 'rxjs';
import { switchMap, take, map } from 'rxjs/operators';
import { QuestionSet } from 'src/app/core/models/question-set.models';
import { AssessmentService } from 'src/app/core/services/assessment.service';
import { PageNames } from 'src/app/core/utils/constants';
import { AssisstantService } from 'src/app/core/services/assisstant.service';
import { environment } from 'src/environments/environment';
import { TutorialService } from 'src/app/core/services/tutorial.service';
import { CacheService } from 'src/app/core/services/cache.service';
import { TutorialSlideshowService } from 'src/app/core/services/tutorial-slideshow.service';
import { User } from 'src/app/core/models/user.model';
import { FeedbackAudio } from '../../question-set/components/audio-feedback/audio-feedback.dictionary';
import { OutroComponent } from '../outro/outro.component';
import { AnswerService } from 'src/app/core/services/answer.service';
import { UserService } from 'src/app/core/services/user.service';
import { ProfileService } from 'src/app/core/services/profile.service';
import { FlowerComponent } from '../flower/flower.component';
import { BeeState, BeeAction } from '../bee/bee.component';
import { Assessment } from 'src/app/core/models/assessment.model';
import { SwiperOptions } from 'swiper';

@Component({
    selector: 'app-question-sets',
    templateUrl: './question-sets.component.html',
    styleUrls: ['./question-sets.component.scss']
})
export class QuestionSetsComponent implements OnInit, AfterViewInit {
    @ViewChildren('flowerComponent')
    public flowerComponents: QueryList<FlowerComponent>;

    public onSlideChange;
    public assessments: Assessment[];
    public questionSets: QuestionSet[] = [];
    public assessmentTitle = '';
    public assessmentSubject: string;
    public user: User = null;
    public flowersColors = ['#A67EFE', '#FE7E7E', '#55CCFF', '#5781D5', '#FFB13D', '#F23EEB'];
    public config: SwiperOptions;
    public showBee$ = new BehaviorSubject<boolean>(false);
    public beeState$ = new Subject<BeeState>();
    public canShowAssessments = false;

    private readonly pageID = 'question-sets-page';
    private assessmentId: number;
    private questionSetsCompletionUpdate = false;
    private allAssessmentQuestionSetsCompleted = false;
    private completedQuestionSet: QuestionSet;

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
            const url = this.router.createUrlTree([], { relativeTo: this.route }).toString();
            const newUrl =  url.split('/');
            newUrl[newUrl.length - 1] = this.assessmentId.toString();
            this.router.navigateByUrl(newUrl.join('/'));
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
                            this.questionSets = assessment.question_sets;
                        }
                        assessment.question_sets.forEach((questionSet, j) => {
                            this.setQuestionSetProperties(assessments[0], questionSet, j);
                        });
                    });
                    this.assessments = assessments;
                    return null;
                }),
                switchMap(() => this.route.queryParamMap.pipe(
                    // if previous route was last question of a question set last question of a question set
                    map((queryParams: ParamMap) => {
                        const recentQuestionSetId = queryParams.get('recent_question_set_id');
                        if (!recentQuestionSetId) {
                            return null;
                        }
                        const recentQuestionSet = this.questionSets.find(
                            questionSet => questionSet.id === parseInt(recentQuestionSetId, 10));
                        if (recentQuestionSet && recentQuestionSet?.completed === false) {
                            this.questionSetsCompletionUpdate = true;
                            return recentQuestionSet;
                        }
                        return null;
                    }),
                    switchMap((completedQuestionSet: QuestionSet) => completedQuestionSet ?
                        this.registerQuestionSetCompletion(completedQuestionSet, user).then(() => completedQuestionSet.id) :
                        of(null))
                    )
                )
            ).subscribe((completedQuestionSetId: number | null) => {
                this.canShowAssessments = true;
                if (completedQuestionSetId) {
                    const completedQuestionSetIndex = this.questionSets.findIndex(e => e.id === completedQuestionSetId);
                    const assessment = this.assessments.find(e => e.id === this.assessmentId);
                    this.completedQuestionSet = {...this.questionSets[completedQuestionSetIndex]};
                    this.setQuestionSetProperties(
                        assessment,
                        this.completedQuestionSet,
                        completedQuestionSetIndex
                    );
                }
                this.allAssessmentQuestionSetsCompleted = this.questionSets.every((questionSet: QuestionSet) => questionSet.completed);
                if (this.questionSetsCompletionUpdate || !this.allAssessmentQuestionSetsCompleted) {
                    this.showBee$.next(true);
                }
            });
        });
        this.assisstantService.setPageID(this.pageID);
        this.tutorialSlideshowService.showTutorialForPage(this.pageID);
    }

    ngAfterViewInit(): void {
        this.tutorialService.currentPage.next(PageNames.questionSets);
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

    public unlockNextQuestionSet(): void {
        let questionSetIndex = this.questionSets.findIndex(e => e.id === this.completedQuestionSet.id);
        this.questionSets[questionSetIndex] = this.completedQuestionSet;
        if (questionSetIndex >= this.questionSets.length - 1) {
            this.beeState$.next({
                action: BeeAction.LEAVE,
                orientation: 'left'
            });
            return;
        }
        if (questionSetIndex < this.questionSets.length - 1) {
            questionSetIndex++;
            const nextQuestionSetClone = {...this.questionSets[questionSetIndex]};
            this.setQuestionSetProperties(
                this.assessments[0],
                nextQuestionSetClone,
                questionSetIndex
            );
            this.questionSets[questionSetIndex] = nextQuestionSetClone;
        }
        const pos = this.flowerComponents.get(questionSetIndex).elementRef.nativeElement.getBoundingClientRect();
        this.beeState$.next({
            action: BeeAction.MOVE,
            position: {
                x: pos.x,
                y: pos.y
            },
            orientation: 'right'
        });
    }

    public showOutro(): void {
        const factory = this.componentFactoryResolver.resolveComponentFactory(OutroComponent);
        const componentRef = this.viewContainerRef.createComponent(factory);
        (componentRef.instance as OutroComponent).outroComplete.subscribe(() => {
            this.viewContainerRef.clear();
        });
    }

    public getQuestionSetIcon(questionSet: QuestionSet): string {
        return questionSet.icon ?
            (environment.API_URL + questionSet.icon) :
            'assets/yellow_circle.svg';
    }

    public playLockedQuestionSetAudioFeedback(questionSetIndex: number): void {
        const questionSetElement = document.getElementById('question-set-' + questionSetIndex.toString()) as HTMLElement;
        questionSetElement.classList.add('vibration');
        setTimeout(() => {
            questionSetElement.classList.remove('vibration');
        }, 500);
        // TODO: change to angry bee sound when available
        const sound = FeedbackAudio.wrongAnswer[0];
        const audio = new Audio(sound);
        audio.load();
        audio.play();
    }

    public async startQuestionSet(id: number): Promise<void> {
        const selectedQuestionSet = this.questionSets.find(questionSet => questionSet.id === id);
        if (selectedQuestionSet.has_sel_question) {
            // If has SEL questions and isn't the student first try: filter questions to remove SEL quedtions
            if (await this.isNotFirstTry(id)) {
                this.questionSets.forEach(questionSet => {
                    questionSet.questions = questionSet.questions?.filter(question => question.question_type !== 'SEL');
                });
            }
        }

        const questionId = selectedQuestionSet.questions[0].id;
        this.answerService.startQuestionSetAnswer(id).subscribe();
        this.router.navigate(['question-sets', id, 'questions', questionId], { relativeTo: this.route });
    }

    private setQuestionSetProperties(assessment: Assessment, questionSet: QuestionSet, questionSetIndex: number): void {
        const cachedCompetency = (this.user.profile.question_sets_competencies?.find(
            c => c.question_set === questionSet.id && questionSet.assessment === assessment.id
        ))?.competency;
        questionSet.competency = [false, false, false].map(
            (_, index) => index + 1 <= cachedCompetency
        );
        const score = questionSet.competency.filter((item) => item === true).length;
        questionSet.honeypots = Math.max(score, 1);
        questionSet.completed = (cachedCompetency !== undefined && cachedCompetency !== null) ? true : false;

        // Students will have to finish the previous questionSet to unlock the next one
        // (whether they failed or not the questionSet)
        questionSet.can_start = questionSetIndex > 0 ? assessment.question_sets[questionSetIndex - 1]?.completed : true;
    }

    private setAnimations(): void {
        if (!this.questionSets?.length) {
            return;
        }
        let initialIndex = this.completedQuestionSet ? this.questionSets.findIndex(e => e.id === this.completedQuestionSet.id) :
            this.questionSets.findIndex(e => !e.completed);
        initialIndex = initialIndex === -1 ? 0 : initialIndex;
        const orientation = (this.questionSetsCompletionUpdate && (initialIndex > (this.questionSets.length / 2))) ? 'left' : 'right';
        const initialPos = this.flowerComponents.get(initialIndex).elementRef.nativeElement.getBoundingClientRect();
        this.beeState$.next({
            action: this.questionSetsCompletionUpdate ? BeeAction.PRAISE : BeeAction.STAY,
            position: {
                x: initialPos.x,
                y: initialPos.y
            },
            orientation,
            honeypots: this.questionSetsCompletionUpdate ? this.completedQuestionSet?.honeypots : null
        });
        if (this.questionSetsCompletionUpdate && this.allAssessmentQuestionSetsCompleted) {
            this.beeState$.next({
                action: BeeAction.LEAVE,
                orientation,
            });
        }
    }

    private async isNotFirstTry(questionSetId: number): Promise<boolean> {
        const answers = await this.answerService.getCompleteStudentAnswersForQuestionSet(questionSetId).toPromise();
        return answers.length > 0;
    }

    private async registerQuestionSetCompletion(questionSet: QuestionSet, user: any): Promise<any> {
        // TODO: Find out why we can't change topic-answer to question-set-answer
        // In the objectStoreNames, it stays as topic-answer
        const searchString = 'topic-answer';
        const response = await this.cacheService.getData(searchString);
        if (!response) { return; }
        const answers = response.answers;
        const correctAnswers = answers.filter(ans => ans.valid);
        let competency = 1;
        let effort = 2;

        if (questionSet.evaluated) {
            competency = Math.ceil(correctAnswers.length * 3 / answers.length);
            competency = competency === 0 ? 1 : competency;
        } else {
            competency = 0;
        }
        const competencies = user.profile.question_sets_competencies;
        const oldCompetency = (competencies?.find(cmp => (cmp.question_set === questionSet.id)))?.competency;

        let newCompetency = 0;
        if (oldCompetency !== undefined) {
            newCompetency = oldCompetency < competency ? competency : oldCompetency;
        } else {
            // set new competency and effort
            newCompetency = competency;
            effort = 5;
        }

        user.profile.effort += effort;

        if (user.profile.question_sets_competencies.length) {
            user.profile.question_sets_competencies.forEach(element => {
                if (element.question_set === questionSet.id) {
                    element.competency = newCompetency;
                }
            });
        }
        user.profile.question_sets_competencies.push({
            competency: newCompetency,
            question_set: questionSet.id,
            profile: user.id
        });

        // update all_question_sets_complete if necessary
        this.cacheService.getData('assessments').then(assessments => {
            const currentAssessment = assessments.find( a => a.id = this.assessmentId);
            let allComplete = true;
            currentAssessment.question_sets.forEach(currentQuestionSet => {
                const cachedCompetency = user.profile.question_sets_competencies.find(
                    c => c.question_set === currentQuestionSet.id)?.competency;
                allComplete =  (cachedCompetency !== undefined && cachedCompetency !== null) ? true : false;
            });
            assessments.find(a => a.id = this.assessmentId).all_question_sets_complete = allComplete;
            this.cacheService.setData('assessments', assessments);
        });

        this.cacheService.setData('user', user);
        this.userService.updateUser(user);

        this.profileService.updateProfile(user.profile).subscribe();

        const test = response;
        test.question_set_competency = newCompetency;

        this.cacheService.setData(searchString, test);
        this.answerService.endQuestionSetAnswer().subscribe();
    }
}
