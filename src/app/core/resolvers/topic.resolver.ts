import { Injectable } from '@angular/core';
import {
  Router, Resolve,
  RouterStateSnapshot,
  ActivatedRouteSnapshot
} from '@angular/router';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Topic } from '../models/topic.models';
import { AssessmentService } from '../services/assessment.service';

@Injectable({
  providedIn: 'root'
})
export class TopicResolver implements Resolve<Topic> {
  constructor(
    private assessmentService: AssessmentService,
    private router: Router
  ) {}

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<Topic> | Topic {
    if (!!this.assessmentService.activeTopic) {
      return this.assessmentService.activeTopic;
    }

    if (!route.parent.paramMap.has('assessment_id') || !route.paramMap.has('topic_id')) {
      this.router.navigate(['']);
      return of(null);
    }

    const assessmentId = parseInt(route.parent.paramMap.get('assessment_id'), 10);
    const topicId = parseInt(route.paramMap.get('topic_id'), 10);

    return this.assessmentService.getAssessmentTopicWithQuestions(assessmentId, topicId).pipe(
      catchError(_ => {
        this.router.navigate(['auth']);
        return of(null);
      })
    );
  }
}
