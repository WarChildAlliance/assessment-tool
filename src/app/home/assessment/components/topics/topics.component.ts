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
import { CacheService } from 'src/app/core/services/cache.service';

@Component({
    selector: 'app-topics',
    templateUrl: './topics.component.html',
    styleUrls: ['./topics.component.scss']
})
export class TopicsComponent implements OnInit, AfterViewInit {
    topics: Topic[];
    private readonly pageID = 'topics-page';
    private user = null;

    public assessmentTitle = '';

    constructor(
        private route: ActivatedRoute,
        private assessmentService: AssessmentService,
        private tutorialService: TutorialService,
        private assisstantService: AssisstantService,
        private cacheService: CacheService
    ) {
    }

    subject: string;

    ngOnInit(): void {
        this.cacheService.getData('active-user').then(user => {
            this.user = user;
            this.route.paramMap.pipe(
                switchMap((params: ParamMap) => {
                    this.subject = params.get('subject');
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
                    topics.forEach(topic => {
                        const cachedCompetency = (user.profile.topics_competencies?.find(c => c.topic === topic.id))?.competency;
                        topic.competency = [false, false, false].map((value, index) => index + 1 <= cachedCompetency);
                        const stars = topic.competency.filter((item) => item === true).length;
                        topic.ribbon = stars === 1 ? 'assets/banner_1.svg' :
                            stars === 2 ? 'assets/banner_2.svg' : stars === 3 ? 'assets/banner_3.svg' : 'assets/banner_0.svg';
                    });
                    this.topics = topics;
                }
            );
        });
        this.assisstantService.setPageID(this.pageID);
    }

    ngAfterViewInit(): void {
        this.tutorialService.currentPage.next(PageNames.topics);
    }


    getTopicIcon(topic: Topic): string {
        return topic.icon ?
            (environment.API_URL + topic.icon) :
            'assets/yellow_circle.svg';
    }

}
