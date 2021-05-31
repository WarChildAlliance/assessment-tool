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
    return this.http.get<Assessment[]>(`${environment.API_URL}/assessments/`);
  }

  getAssessment(assessmentId: number): Observable<Assessment> {
    return this.http.get<Assessment>(`${environment.API_URL}/assessments/${assessmentId}/`);
  }

  getAssessmentTopics(assessmentId: number): Observable<Topic[]> {

    return forkJoin ( {
      topics: this.http.get<Topic[]>(`${environment.API_URL}/assessments/${assessmentId}/topics/`),
      competencies: this.http.get<Object[]>(`${environment.API_URL}/gamification/topic-competencies/get_self/`)
    }).pipe(
      map(
        res => {
          for (let topic of res.topics) {
            let matching_competency = res.competencies.find(competency => competency['topic'] === topic.id);
            topic.competency = matching_competency['competency'];
          } 
          return res.topics;
      })
    )
  }

  getAssessmentTopicWithQuestions(assessmentId: number, topicId: number): Observable<Topic> {
    return this.http.get<Topic>(`${environment.API_URL}/assessments/${assessmentId}/topics/${topicId}/`).pipe(
      switchMap(
        topic => this.getAssessmentTopicQuestions(assessmentId, topicId).pipe(
          map(questions => {
            topic.questions = questions;
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
