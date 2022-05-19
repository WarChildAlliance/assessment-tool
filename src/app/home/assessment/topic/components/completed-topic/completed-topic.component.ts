import { AfterViewInit, Component, OnInit } from '@angular/core';
import { AnswerService } from 'src/app/core/services/answer.service';
import { Observable } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { AssisstantService } from 'src/app/core/services/assisstant.service';
import { CacheService } from 'src/app/core/services/cache.service';
import { UserService } from 'src/app/core/services/user.service';
import { ProfileService } from 'src/app/core/services/profile.service';
import { PageNames } from 'src/app/core/utils/constants';
import { TutorialService } from 'src/app/core/services/tutorial.service';
import { AssessmentService } from 'src/app/core/services/assessment.service';
import { TranslateService } from '@ngx-translate/core';
import { TutorialSlideshowService } from 'src/app/core/services/tutorial-slideshow.service';
import { Topic } from 'src/app/core/models/topic.models';

@Component({
    selector: 'app-completed-topic',
    templateUrl: './completed-topic.component.html',
    styleUrls: ['./completed-topic.component.scss']
})
export class CompletedTopicComponent implements OnInit, AfterViewInit {

    private blockNavigation = true;
    private readonly pageID = 'completed-topic-page';

    public competency = 1;
    public effort = 2;
    public topic: Topic = null;
    public assessmentId: number = null;

    constructor(
        private router: Router,
        private assisstantService: AssisstantService,
        private profileService: ProfileService,
        private userService: UserService,
        private answerService: AnswerService,
        private assessmentService: AssessmentService,
        private cacheService: CacheService,
        private route: ActivatedRoute,
        private tutorialService: TutorialService,
        public translate: TranslateService,
        private tutorialSlideshowService: TutorialSlideshowService,
    ) {

    }

    ngOnInit(): void {
        this.assisstantService.setPageID(this.pageID);
        this.tutorialSlideshowService.showTutorialForPage(this.pageID);

        this.route.paramMap.subscribe((params) => {
            const assessmentID = parseInt(params.get('assessment_id'), 10);
            this.assessmentId = assessmentID;
            const topicId = parseInt(params.get('topic_id'), 10);
            this.assessmentService.getAssessmentTopic(assessmentID, topicId).subscribe(
                (topic) => {
                    this.topic = topic;
                }
            );
        });

        const searchString = 'topic-answer';
        this.cacheService.getData(searchString).then(response => {
            if (!response){this.router.navigate(['../../'], { relativeTo: this.route }); }
            const answers = response.answers;
            const correctAnswers = answers.filter(ans => ans.valid);
            if (this.topic.evaluated) {
                this.competency = Math.ceil(correctAnswers.length * 3 / answers.length);
                this.competency = this.competency === 0 ? 1 : this.competency;
            } else {
                this.competency = 0;
            }

            this.cacheService.getData('user').then(user => {
                const newUser = { ...user };
                const competencies = user.profile.topics_competencies;
                const oldCompetency = (competencies?.find(competency => (competency.topic === this.topic.id)))?.competency;

                let newCompetency = 0;
                let difference = 0;
                if (oldCompetency !== undefined) {
                    newCompetency = oldCompetency < this.competency ? this.competency : oldCompetency;
                    difference = oldCompetency < this.competency ? this.competency - oldCompetency : 0;
                } else {
                    // set new competency and effort
                    newCompetency = this.competency;
                    this.effort = 5;
                    difference = this.competency;
                }

                newUser.profile.total_competency += difference;
                newUser.profile.effort += this.effort;


                if (newUser.profile.topics_competencies.length) {
                    newUser.profile.topics_competencies.forEach(element => {
                        if (element.topic === this.topic.id) {
                            element.competency = newCompetency;
                        }
                    });
                }
                newUser.profile.topics_competencies.push({
                    competency: newCompetency,
                    topic: this.topic.id,
                    profile: newUser.id
                });


                // update all_topics_complete if necessary
                this.cacheService.getData('assessments').then( assessments => {
                    const currentAssessment = assessments.find( a => a.id = this.assessmentId);
                    let allComplete = true;
                    currentAssessment.topics.forEach(topic => {
                        const cachedCompetency = newUser.profile.topics_competencies.find(c => c.topic === topic.id)?.competency;
                        allComplete =  (cachedCompetency !== undefined && cachedCompetency !== null) ? true : false;
                    });
                    assessments.find( a => a.id = this.assessmentId).all_topics_complete = allComplete;
                    this.cacheService.setData('assessments', assessments);
                });

                this.cacheService.setData('user', newUser);
                this.userService.updateUser(newUser);

                this.profileService.updateProfile(newUser.profile).subscribe();

                const test = response;
                test.topic_competency = newCompetency;

                this.cacheService.setData(searchString, test);
                this.answerService.endTopicAnswer().subscribe();
            });
        });
    }

    ngAfterViewInit(): void {
        this.blockNavigation = false;
        this.tutorialService.currentPage.next(PageNames.topicCompleted);
    }

    /* Shows modal confirmation before leave the page if is evluated topic
     */
    public canDeactivate(event: any): Observable<boolean> | boolean {
        if (this.blockNavigation) {
            return false;
        }
        this.blockNavigation = true;
        return true;
    }

    public goToHomePage(): void {
        this.blockNavigation = false;
        this.router.navigate(['../../../']);
    }

    public goToTopicPage(): void {
        this.blockNavigation = false;
        this.router.navigate(['../../'], { relativeTo: this.route });
    }
}
