import { AfterViewInit, Component, OnInit } from '@angular/core';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { throwError } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { Topic } from 'src/app/core/models/topic.models';
import { AssessmentService } from 'src/app/core/services/assessment.service';
import { PageNames } from 'src/app/core/utils/constants';
import { AssisstantService } from 'src/app/core/services/assisstant.service';
import { environment } from 'src/environments/environment';
import { TutorialService } from 'src/app/core/services/tutorial.service';

@Component({
    selector: 'app-topics',
    templateUrl: './topics.component.html',
    styleUrls: ['./topics.component.scss']
})
export class TopicsComponent implements OnInit, AfterViewInit {
    topics: Topic[];
    private readonly pageID = 'topics-page';

    constructor(
        private route: ActivatedRoute,
        private assessmentService: AssessmentService,
        private tutorialService: TutorialService,
        private assisstantService: AssisstantService,
    ) { }

    subject: string;

    ngOnInit(): void {
        this.route.paramMap.pipe(
            switchMap((params: ParamMap) => {
                this.subject = params.get('subject');
                if (params.has('assessment_id')) {
                    const id = parseInt(params.get('assessment_id'), 10);
                    return this.assessmentService.getAssessmentTopics(id);
                }
                throwError('No assessment id provided');
            })
        ).subscribe(
            topics => {
                topics.forEach(topic => {
                    topic.competency = [false, false, false].map((value, index) => index + 1 <= topic.competency ? true : false);
                });
                this.topics = topics;
            }
        );
        this.assisstantService.setPageID(this.pageID);
    }

    ngAfterViewInit(): void {
        this.tutorialService.currentPage.next(PageNames.topics);
    }


    getTopicIcon(topic: Topic): string {

        const imageUrl = topic.icon ?
            (environment.API_URL + topic.icon) :
            'assets/icons/Bee.svg';

        return imageUrl;
    }

}
