import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { throwError } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { Topic } from 'src/app/core/models/topic.models';
import { AssessmentService } from 'src/app/core/services/assessment.service';
import { AssisstantService } from 'src/app/core/services/assisstant.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-topics',
  templateUrl: './topics.component.html',
  styleUrls: ['./topics.component.scss']
})
export class TopicsComponent implements OnInit {
  topics: Topic[];
  private readonly pageID = 'topics-page';

  constructor(
    private route: ActivatedRoute,
    private assessmentService: AssessmentService,
    private assisstantService: AssisstantService,
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
    this.assisstantService.setPageID(this.pageID);
  }



  getTopicIcon(topic: Topic): string {

    const imageUrl = topic.icon ?
      (environment.API_URL + topic.icon) :
      'assets/icons/Bee.svg';

    return imageUrl;
  }

}
