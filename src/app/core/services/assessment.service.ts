import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { Assessment } from '../models/assessment.model';
import { Attachment } from '../models/attachment.model';
import { GeneralQuestion, QuestionSelect, QuestionSort } from '../models/question.model';
import { Topic } from '../models/topic.models';
import { CacheService } from './cache.service';


@Injectable({
  providedIn: 'root'
})
export class AssessmentService {

  storedAssessmentsSource: BehaviorSubject<Assessment[]> = new BehaviorSubject<Assessment[]>([]);
  // storedAssessments: Observable<Assessment[]> = this.storedAssessmentsSource.asObservable();

  get storedAssessments(): Observable<Assessment[]> {
    return this.storedAssessmentsSource.asObservable();
  }

  constructor(
    private http: HttpClient,
    private cacheService: CacheService,
  ) {
    this.loadAllAssessments();
  }

  loadAllAssessments(): void {
    if (!this.cacheService.networkStatus.getValue()) {
      this.cacheService.getData('assessments').then(
        (assessments) => {
          this.storedAssessmentsSource.next(assessments);
        }
      );
      return;
    }

    this.getAssessmentsDeep().subscribe(assessments => {
      this.cacheService.setData('assessments', assessments);
      this.storedAssessmentsSource.next(assessments);
      for (const assessment of assessments) {
        this.getIcon(assessment.icon);
        for (const topic of assessment.topics) {
          this.getIcon(topic.icon);
          for (const question of topic.questions) {
            this.getAttachments(question.attachments);
            if (question.hasOwnProperty('options')) {
              for (const option of (question as QuestionSort | QuestionSelect).options) {
                this.getAttachments(option.attachments);
              }
            }
          }
        }
      }
    });
  }

  // Fetch the icon from the backend to allow accessing it offline
  private getIcon(icon: string): void {
    if (!icon) { return; }
    this.http.get(environment.API_URL + icon, { responseType: 'arraybuffer' }).subscribe();
  }

  // Fetch the attachments from the backend to allow accessing them offline
  //  (this could probably be refactored in a single function with the above)
  private getAttachments(attachments: Attachment[]): void {
    if (!attachments || !attachments.length) { return; }

    for (const attachment of attachments) {
      this.http.get(environment.API_URL + attachment.file, { responseType: 'arraybuffer' }).subscribe();
    }
  }

  getTutorial(): Observable<Assessment> {
    return this.storedAssessments.pipe(
      map(assessmentsList => {
        return assessmentsList.find(a => a.subject === 'TUTORIAL');
      })
    );
  }

  getAssessments(): Observable<Assessment[]> {

    return this.storedAssessments.pipe(
      // THIS IS ONLY TEMPORARY FOR PRE-SEL AND POST-SEL, TODO REMOVE AFTERWARD
      map(assessmentsList => {
        const assessments = this.getSELUnlocking(assessmentsList);

        return assessments;

      })
      // END OF TEMPORARY
    );
  }

  getSELUnlocking(assessmentsList): Assessment[] {
    const mutatedAssessmentList = assessmentsList;

    let i = 1;

    mutatedAssessmentList.map(assessment => {
      // Lock all assessments by default
      // Sorting them
      assessment.locked = true;
      if (assessment.subject === 'TUTORIAL') { assessment.order = 0; }
      if (assessment.subject === 'PRESEL') { assessment.order = 1; }
      if (assessment.subject === 'POSTSEL') { assessment.order = assessmentsList.length; }

      i = assessment.order ? i : i + 1;
      assessment.order = assessment.order === undefined ? i : assessment.order;

    });

    mutatedAssessmentList.sort((a, b) => {
      return a.order - b.order;
    });

    // If tutorial and not complete, just return tutorial
    const tutorial = mutatedAssessmentList.find(assessment => assessment.subject === 'TUTORIAL');

    if (!!tutorial && !tutorial.all_topics_complete) {
      tutorial.locked = false;
      return mutatedAssessmentList;
    }


    // If we dont have the tutorial or complete, SEL locking
    // Find preSel and postSel assessments if they exist
    const preSelAssessment = mutatedAssessmentList.find(assessment => assessment.subject === 'PRESEL');
    const postSelAssessment = mutatedAssessmentList.find(assessment => assessment.subject === 'POSTSEL');

    // If there's a preSel assessment and it hasn't been completed, lock the other assessments and unlock it
    if (!!preSelAssessment && !preSelAssessment.all_topics_complete) {
      preSelAssessment.locked = false;
      return mutatedAssessmentList;
    } else {
      mutatedAssessmentList.map(assessment => {
        assessment.locked = false;
      });
      if (preSelAssessment) {
        preSelAssessment.locked = true;
      }
    }

    // If there's a postSel assessment, unlock it only if all other assessments are complete
    if (!!postSelAssessment) {
      let uncompleteTopicLeft = false;
      mutatedAssessmentList.forEach(assessment => {
        assessment.locked = true;
        if (!assessment.all_topics_complete && assessment.subject !== 'POSTSEL') {
          uncompleteTopicLeft = true;
          assessment.locked = false;
          return;
        }
      });
      postSelAssessment.locked = uncompleteTopicLeft ? true : false;
    }

    return mutatedAssessmentList;
  }

  getAssessment(assessmentId: number): Observable<Assessment> {
    return this.storedAssessments.pipe(map((assessments) => {
      return assessments
        .find(assessment => (assessment.id === assessmentId));
    }));
  }

  getAssessmentTopics(assessmentId: number): Observable<Topic[]> {
    return this.storedAssessments.pipe(map((assessments) => {
      return assessments
        .find(assessment => (assessment.id === assessmentId)).topics;
    }));
  }

  getAssessmentTopic(assessmentId: number, topicId: number): Observable<Topic> {
    return this.storedAssessments.pipe(map((assessments) => {
      return assessments
        .find(assessment => (assessment.id === assessmentId)).topics
        .find(topic => (topic.id === topicId));
    }));
  }

  getAssessmentTopicQuestions(assessmentId: number, topicId: number): Observable<GeneralQuestion[]> {
    return this.storedAssessments.pipe(map((assessments) => {
      return assessments
        .find(assessment => (assessment.id === assessmentId)).topics
        .find(topic => (topic.id === topicId)).questions;
    }));
  }

  getAssessmentTopicQuestion(assessmentId: number, topicId: number, questionId: number): Observable<GeneralQuestion> {
    return this.storedAssessments.pipe(map((assessments) => {
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
