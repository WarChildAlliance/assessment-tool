import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { from, Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Assessment } from '../models/assessment.model';
import { GeneralQuestion } from '../models/question.model';
import { Topic } from '../models/topic.models';
import { CacheService } from './cache.service';

@Injectable({
  providedIn: 'root'
})
export class AssessmentService {
  activeTopic: Topic;

  constructor(
    private http: HttpClient,
    private cacheService: CacheService
  ) { }

  getAssessments(): Observable<Assessment[]> {
    return from(this.cacheService.getData('assessments').then(
      (assessments) => {
        return assessments;
      }

      /*
      // THIS IS ONLY TEMPORARY FOR PRE-SEL AND POST-SEL, TODO REMOVE AFTERWARD
      map(assessmentsList => {
        assessmentsList.map(assessment => {
          // Lock all assessments by default
          // assessment.locked = true;
        });

        // Find preSel and postSel assessments if they exist
        const preSelAssessment = assessmentsList.find(assessment => assessment.subject === 'PRESEL');
        const postSelAssessment = assessmentsList.find(assessment => assessment.subject === 'POSTSEL');

        // If there's a preSel assessment and it hasn't been completed, lock the other assessments and unlock it
        if (!!preSelAssessment && !preSelAssessment.all_topics_complete) {
          preSelAssessment.locked = false;
        } else {
          assessmentsList.map(assessment => {
            assessment.locked = false;
          });
          if (preSelAssessment) { preSelAssessment.locked = true; }
        }

        // If there's a postSel assessment, unlock it only if all other assessments are complete
        if (!!postSelAssessment) {
          let uncompleteTopicLeft = false;
          assessmentsList.forEach(assessment => {
            if (!assessment.all_topics_complete && assessment.subject !== 'POSTSEL') { uncompleteTopicLeft = true; return; }
          });
          postSelAssessment.locked = uncompleteTopicLeft ? true : false;
        }

        return assessmentsList;
      })
      // END OF TEMPORARY
      */

    ));
  }

  getAssessment(assessmentId: number): Observable<Assessment> {
    return from(this.cacheService.getData('assessments').then(
      (assessments) => {
        return assessments
          .find(assessment => (assessment.id === assessmentId));
      }
    ));
  }

  getAssessmentTopics(assessmentId: number): Observable<Topic[]> {
    return from(this.cacheService.getData('assessments').then(
      (assessments) => {
        return assessments
          .find(assessment => (assessment.id === assessmentId)).topics;
      }
    ));
  }

  getAssessmentTopic(assessmentId: number, topicId: number): Observable<Topic> {
    return from(this.cacheService.getData('assessments').then(
      (assessments) => {
        return assessments
          .find(assessment => (assessment.id === assessmentId)).topics
          .find(topic => (topic.id === topicId));
      }
    ));
  }

  getAssessmentTopicQuestions(assessmentId: number, topicId: number): Observable<GeneralQuestion[]> {
    return from(this.cacheService.getData('assessments').then(
      (assessments) => {
        return assessments
          .find(assessment => (assessment.id === assessmentId)).topics
          .find(topic => (topic.id === topicId)).questions;
      }
    ));
  }

  getAssessmentTopicQuestion(assessmentId: number, topicId: number, questionId: number): Observable<GeneralQuestion> {
    return from(this.cacheService.getData('assessments').then(
      (assessments) => {
        return assessments
          .find(assessment => (assessment.id === assessmentId)).topics
          .find(topic => (topic.id === topicId)).questions
          .find(question => (question.id === questionId));
      }
    ));
  }

  getAssessmentsDeep(): Observable<Assessment[]> {
    return this.http.get<Assessment[]>(`${environment.API_URL}/assessments/get_all/`);
  }
}
