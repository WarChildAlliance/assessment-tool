import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { Assessment } from '../models/assessment.model';
import { Attachment } from '../models/attachment.model';
import { DraggableOption, GeneralQuestion, QuestionDragDrop,
  QuestionSelect, QuestionSort, QuestionTypeEnum } from '../models/question.model';
import { Topic } from '../models/topic.models';
import { CacheService } from './cache.service';
import { TextToSpeechService } from './text-to-speech.service';


@Injectable({
  providedIn: 'root'
})
export class AssessmentService {

  private storedAssessmentsSource: BehaviorSubject<Assessment[]> = new BehaviorSubject<Assessment[]>([]);
  // storedAssessments: Observable<Assessment[]> = this.storedAssessmentsSource.asObservable();

  constructor(
    private http: HttpClient,
    private cacheService: CacheService,
    private ttsService: TextToSpeechService
  ) {
    this.loadAllAssessments();
  }

  public get storedAssessments(): Observable<Assessment[]> {
    return this.storedAssessmentsSource.asObservable();
  }

  public loadAllAssessments(): void {
    if (!this.cacheService.networkStatus.getValue()) {
      this.cacheService.getData('assessments').then(
        (assessments) => {
          this.storedAssessmentsSource.next(assessments);
        }
      );
      return;
    }

    this.getAssessmentsDeep().subscribe(assessments => {
      for (const assessment of assessments) {
        this.getIcon(assessment.icon);
        for (const topic of assessment.topics) {
          this.getIcon(topic.icon);
          for (const question of topic.questions) {
            this.getQuestionTitleAudio(question, assessment.language);
            this.getAttachments(question.attachments);
            if (question.hasOwnProperty('options')) {
              for (const option of (question as QuestionSort | QuestionSelect).options) {
                this.getAttachments(option.attachments);
              }
            }
            if (question.question_type === QuestionTypeEnum.DragAndDrop) {
              const bgImage = question.attachments.find(
                e => e.attachment_type === 'IMAGE' && e.background_image);
              this.getAttachments([bgImage]);

              this.getQuestionDraggableOptions(assessment.id, topic.id, question.id).subscribe(
                (res: DraggableOption[]) => {
                  (question as QuestionDragDrop).draggable_options = res ?? [];
                  for (const option of res) {
                    this.getAttachments(option.attachments);
                  }
                }
              );
            }
          }
        }
      }
      this.cacheService.setData('assessments', assessments);
      this.storedAssessmentsSource.next(assessments);
    });
  }

  public getTutorial(): Observable<Assessment> {
    return this.storedAssessments.pipe(
      map(assessmentsList => assessmentsList.find(a => a.subject === 'TUTORIAL'))
    );
  }

  public getAssessments(): Observable<Assessment[]> {
    return this.storedAssessments.pipe(
      map(assessmentsList => this.sortAssessments(assessmentsList))
    );
  }

  public sortAssessments(assessmentsList): Assessment[] {
    const mutatedAssessmentList = assessmentsList;

    let i = 1;

    // Sorting assessments
    mutatedAssessmentList.map(assessment => {
      if (assessment.subject === 'TUTORIAL') { assessment.order = 0; }
      if (assessment.subject === 'PRESEL') { assessment.order = 1; }
      if (assessment.subject === 'POSTSEL') { assessment.order = assessmentsList.length; }

      i = assessment.order ? i : i + 1;
      assessment.order = assessment.order === undefined ? i : assessment.order;
    });

    mutatedAssessmentList.sort((a, b) => a.order - b.order);

    // If tutorial and not complete, return tutorial unlocked and everything else locked
    const tutorial = mutatedAssessmentList.find(assessment => assessment.subject === 'TUTORIAL');
    if (!!tutorial && !tutorial.all_topics_complete) {
      mutatedAssessmentList.map(assessment => {
        assessment.locked = !(assessment.subject === 'TUTORIAL');
      });
    }

    return mutatedAssessmentList;
  }

  public getAssessment(assessmentId: number): Observable<Assessment> {
    return this.storedAssessments.pipe(map((assessments) => assessments
        .find(assessment => (assessment.id === assessmentId))));
  }

  public getAssessmentTopics(assessmentId: number): Observable<Topic[]> {
    return this.storedAssessments.pipe(map((assessments) => assessments
        .find(assessment => (assessment.id === assessmentId)).topics));
  }

  public getAssessmentTopic(assessmentId: number, topicId: number): Observable<Topic> {
    return this.storedAssessments.pipe(map((assessments) => assessments
        .find(assessment => (assessment.id === assessmentId)).topics
        .find(topic => (topic.id === topicId))));
  }

  public getAssessmentTopicQuestions(assessmentId: number, topicId: number): Observable<GeneralQuestion[]> {
    return this.storedAssessments.pipe(map((assessments) => assessments
        .find(assessment => (assessment.id === assessmentId)).topics
        .find(topic => (topic.id === topicId)).questions));
  }

  public getAssessmentTopicQuestion(assessmentId: number, topicId: number, questionId: number): Observable<GeneralQuestion> {
    return this.storedAssessments.pipe(map((assessments) => assessments
        .find(assessment => (assessment.id === assessmentId)).topics
        .find(topic => (topic.id === topicId)).questions
        .find(question => (question.id === questionId))
    ));
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
      const path = attachment.file.includes(environment.API_URL) ? attachment.file :
        environment.API_URL + attachment.file;
      this.http.get(path, { responseType: 'arraybuffer' }).subscribe();
    }
  }

  private getQuestionTitleAudio(question: GeneralQuestion, language: string): void {
    this.ttsService.getSynthesizedSpeech(
      language === 'ENG' ? 'en-US' : 'ar-XA',
      question.title
    ).subscribe((audioURL: string) => {
      if (audioURL) {
        question.title_audio = audioURL;
      }
    });
  }

  private getAssessmentsDeep(): Observable<Assessment[]> {
    return this.http.get<Assessment[]>(`${environment.API_URL}/assessments/get_assessment/`);
  }

  private getQuestionDraggableOptions(assessmentId: number, topicId: number, questionId: number): Observable<any> {
    return this.http.get(
      `${environment.API_URL}/assessments/${assessmentId}/topics/${topicId}/questions/${questionId}/draggable/`
    );
  }
}
