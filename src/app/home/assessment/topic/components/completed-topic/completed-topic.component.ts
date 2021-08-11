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
    public effort = 2; // TODO should be 5 for the first try and 2 for other one -> change serializer!

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

        // TODO we only store answers in one storage. No need to store in two different ones
        const searchString = this.cacheService.networkStatus.getValue() ? 'active-topic-answer' : 'active-topic-answer-local';
        this.cacheService.getData(searchString).then( response => {
            const answers = response.answers;
            const correctAnswers = answers.filter( ans => ans.valid);
            this.competency = Math.ceil(correctAnswers.length * 3 / answers.length);

            this.cacheService.getData('active-user').then( user => {
                const newUser = user;
                // TODO the competency should actually be calculated per topic once
                // And then needs to be set on the topic

                newUser.profile.total_competency += this.competency;
                newUser.profile.effort += this.effort;

                // TODO this shoud be done in a single step through the user service!
                this.cacheService.setData('active-user', newUser);
                this.userService.updateUser(newUser);
                this.profileService.updateProfile(newUser.profile).subscribe (profile => {
                    console.log('TODO show success message', profile);
                });
            });

            // TODO show in anias design
            this.answerService.endTopicAnswer().subscribe();
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
