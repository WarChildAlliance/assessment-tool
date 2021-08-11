import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { forkJoin, Observable } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { Assessment } from '../models/assessment.model';
import { GeneralQuestion } from '../models/question.model';
import { Topic } from '../models/topic.models';

@Injectable({
  providedIn: 'root'
})
export class AssessmentService {
  activeTopic: Topic;

  constructor(
    private http: HttpClient
  ) { }

  getAssessments(): Observable<Assessment[]> {
    return this.http.get<Assessment[]>(`${environment.API_URL}/assessments/`).pipe(

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

      );
  }

  getAssessment(assessmentId: number): Observable<Assessment> {
    return this.http.get<Assessment>(`${environment.API_URL}/assessments/${assessmentId}/`);
  }

  getAssessmentTopics(assessmentId: number): Observable<Topic[]> {

    return forkJoin({
      topics: this.http.get<Topic[]>(`${environment.API_URL}/assessments/${assessmentId}/topics/`),
      competencies: this.http.get<any[]>(`${environment.API_URL}/gamification/topic-competencies/`)
    }).pipe(
      map(
        res => {
          for (const topic of res.topics) {
            const matchingCompetency = res.competencies.find(competency => competency.topic === topic.id);
            topic.competency = matchingCompetency ? matchingCompetency.competency : null;
          }
          return res.topics;
        })
    );
  }

  getAssessmentTopicWithQuestions(assessmentId: number, topicId: number): Observable<Topic> {
    return this.http.get<Topic>(`${environment.API_URL}/assessments/${assessmentId}/topics/${topicId}/`).pipe(
      switchMap(
        topic => this.getAssessmentTopicQuestions(assessmentId, topicId).pipe(
          map(questions => {
            topic.questions = questions.sort((a, b) => a.order - b.order);
            return topic;
          })
        )
      )
    );
  }

  getAssessmentTopicQuestions(assessmentId: number, topicId: number): Observable<GeneralQuestion[]> {
    return this.http.get<GeneralQuestion[]>(`${environment.API_URL}/assessments/${assessmentId}/topics/${topicId}/questions/`);
  }
}
