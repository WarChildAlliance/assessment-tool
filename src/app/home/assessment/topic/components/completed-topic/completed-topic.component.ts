import { Component, OnInit } from '@angular/core';
import { AnswerService } from 'src/app/core/services/answer.service';
import { Observable } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { AssisstantService } from 'src/app/core/services/assisstant.service';

@Component({
    selector: 'app-completed-topic',
    templateUrl: './completed-topic.component.html',
    styleUrls: ['./completed-topic.component.scss']
})
export class CompletedTopicComponent implements OnInit {

    blockNavigation = true;
    private readonly pageID = 'completed-topic-page';

    constructor(
        private answerService: AnswerService,
        private router: Router,
        private assisstantService: AssisstantService,
        private route: ActivatedRoute,
    ) {

    }

    ngOnInit(): void {
        this.assisstantService.setPageID(this.pageID);
        this.answerService.endTopicAnswer().subscribe();
        console.log(this.answerService, this.answerService.endTopicAnswer() );
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

    goToTopicPage(): void {
        this.blockNavigation = false;
        this.router.navigate(['../../'], { relativeTo: this.route });
    }
}
