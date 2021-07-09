import { AfterViewInit, Component, OnInit } from '@angular/core';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { throwError } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { Topic } from 'src/app/core/models/topic.models';
import { AssessmentService } from 'src/app/core/services/assessment.service';
import { TutorialService } from 'src/app/core/services/tutorial.service';
import { PageNames } from 'src/app/core/utils/constants';

@Component({
  selector: 'app-topics',
  templateUrl: './topics.component.html',
  styleUrls: ['./topics.component.scss']
})
export class TopicsComponent implements OnInit, AfterViewInit {
  topics: Topic[];

  constructor(
    private route: ActivatedRoute,
    private assessmentService: AssessmentService,
    private tutorialSerice: TutorialService
  ) { }

  ngOnInit(): void {
    this.route.paramMap.pipe(
      switchMap((params: ParamMap) => {
        if (params.has('assessment_id')) {
          const id = parseInt(params.get('assessment_id'), 10);
          return this.assessmentService.getAssessmentTopics(id);
        }
        throwError('No assessment id provided');
      })
    ).subscribe(
      topics => {
        topics.forEach(topic => {
          let competencyArr = [];
          if (topic.competency === 1) {
            competencyArr = [true, false, false];
          } else if (topic.competency === 2) {
            competencyArr = [true, true, false];
          } else if (topic.competency === 3) {
            competencyArr = [true, true, true];
          }
          topic.competency = competencyArr;
        });

        this.topics = topics;
      }
    );
  }

  ngAfterViewInit(): void {
    this.tutorialSerice.currentPage.next(PageNames.topics);
  }

}
