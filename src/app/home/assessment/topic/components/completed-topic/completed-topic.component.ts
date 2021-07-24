import { AfterViewInit, Component, OnInit } from '@angular/core';
import { AnswerService } from 'src/app/core/services/answer.service';
import { Observable } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { AssisstantService } from 'src/app/core/services/assisstant.service';
import { TutorialService } from 'src/app/core/services/tutorial.service';
import { PageNames } from 'src/app/core/utils/constants';

@Component({
    selector: 'app-completed-topic',
    templateUrl: './completed-topic.component.html',
    styleUrls: ['./completed-topic.component.scss']
})
export class CompletedTopicComponent implements OnInit, AfterViewInit {

    blockNavigation = true;
    private readonly pageID = 'completed-topic-page';

    constructor(
        private answerService: AnswerService,
        private router: Router,
        private assisstantService: AssisstantService,
        private tutorialSerice: TutorialService,
        private route: ActivatedRoute
    ) {

    }

    ngOnInit(): void {
        this.assisstantService.setPageID(this.pageID);
        this.answerService.endTopicAnswer().subscribe();
        this.route.data.subscribe(res => res.topic.id === 18 ? this.blockNavigation = false : this.blockNavigation = true);
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

    goToTopicPage(): void {
        this.blockNavigation = false;
        this.router.navigate(['../../../']);
    }

    ngAfterViewInit(): void {
        this.tutorialSerice.currentPage.next(PageNames.topicCompleted);
      }
}
