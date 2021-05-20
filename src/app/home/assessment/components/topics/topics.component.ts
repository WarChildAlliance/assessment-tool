import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { throwError } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { Topic } from 'src/app/core/models/topic.models';
import { AssessmentService } from 'src/app/core/services/assessment.service';

@Component({
  selector: 'app-topics',
  templateUrl: './topics.component.html',
  styleUrls: ['./topics.component.scss']
})
export class TopicsComponent implements OnInit {
  topics: Topic[];

  constructor(
    private route: ActivatedRoute,
    private assessmentService: AssessmentService
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
      topics => this.topics = topics
    );
  }

}
