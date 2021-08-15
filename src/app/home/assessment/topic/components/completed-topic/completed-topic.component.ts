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

@Component({
    selector: 'app-completed-topic',
    templateUrl: './completed-topic.component.html',
    styleUrls: ['./completed-topic.component.scss']
})
export class CompletedTopicComponent implements OnInit, AfterViewInit {

    public competency = 1;
    public effort = 2;
    private topic = null;
    private user;

    blockNavigation = true;
    private readonly pageID = 'completed-topic-page';

    constructor(
        private answerService: AnswerService,
        private router: Router,
        private assisstantService: AssisstantService,
        private cacheService: CacheService,
        private userService: UserService,
        private profileService: ProfileService,
        private route: ActivatedRoute,
        private tutorialService: TutorialService,
    ) {

    }

    ngOnInit(): void {
        this.assisstantService.setPageID(this.pageID);

        this.route.data.subscribe( res => {
            this.topic = res.topic;
        });

        // TODO we only store answers in one storage. No need to store in two different ones
        const searchString = this.cacheService.networkStatus.getValue() ? 'active-topic-answer' : 'active-topic-answer-local';
        this.cacheService.getData(searchString).then( response => {
            const answers = response.answers;
            const correctAnswers = answers.filter( ans => ans.valid);
            this.competency = Math.ceil(correctAnswers.length * 3 / answers.length);
            this.competency = this.competency === 0 ? 1 : this.competency;
            this.cacheService.getData('active-user').then(user => {
                this.user = user;
                console.log(this.user);
            });
            this.cacheService.getData('active-user').then(user => {
                const newUser = {...this.user};
                console.log(newUser);
                const oldCompetency = (user.competencies?.find( competency => competency.assessmentId === this.topic.assessment
                    && competency.topicId === this.topic.id))?.competency;

                let newCompetency = 0;
                let difference = 0;

                if (oldCompetency) {
                    newCompetency = oldCompetency < this.competency ? this.competency : oldCompetency;
                    difference = oldCompetency < this.competency ? this.competency - oldCompetency : 0;
                } else {
                    newCompetency = this.competency;
                    this.effort = 5;
                }

                console.log(difference);
                newUser.profile.total_competency += difference;
                newUser.profile.effort += this.effort;
                newUser.competencies.forEach(element => {
                    if (element.assessmentId === this.topic.assessment && element.topicId === this.topic.id) {
                        element.competency = newCompetency;
                    }
                });

                // this.cacheService.setData('active-user', newUser);
                this.userService.updateUser(newUser);

                this.profileService.updateProfile(newUser.profile).subscribe();

                const test = response;
                test.topic_competency = newCompetency;

                this.cacheService.setData(searchString, test);

                this.answerService.endTopicAnswer().subscribe();
            });

            this.route.data.subscribe(res => res.topic.id === 18 ? this.blockNavigation = false : this.blockNavigation = true);
            }
        );

    }

    /* Shows modal confirmation before leave the page if is evluated topic
     */
    canDeactivate(event: any): Observable<boolean> | boolean {
        if (this.blockNavigation) {
            return false;
        }
        this.blockNavigation = true;
        return true;
    }

    goToHomePage(): void {
        this.blockNavigation = false;
        this.router.navigate(['../../../']);
    }

    ngAfterViewInit(): void {
        this.blockNavigation = false;
        this.tutorialService.currentPage.next(PageNames.topicCompleted);
    }

    goToTopicPage(): void {
        this.blockNavigation = false;
        this.router.navigate(['../../'], { relativeTo: this.route });
    }

}
