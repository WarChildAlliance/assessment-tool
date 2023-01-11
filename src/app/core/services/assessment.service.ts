import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { Assessment } from '../models/assessment.model';
import { Attachment } from '../models/attachment.model';
import { DraggableOption, GeneralQuestion, QuestionDragDrop,
  QuestionSelect, QuestionSort, QuestionTypeEnum } from '../models/question.model';
import { QuestionSet } from '../models/question-set.models';
import { CacheService } from './cache.service';
import { TextToSpeechService } from './text-to-speech.service';
import { Router } from '@angular/router';


@Injectable({
  providedIn: 'root'
})
export class AssessmentService {

  private storedAssessmentsSource: BehaviorSubject<Assessment[]> = new BehaviorSubject<Assessment[]>([]);
  private loading: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  // storedAssessments: Observable<Assessment[]> = this.storedAssessmentsSource.asObservable();

  constructor(
    private http: HttpClient,
    private cacheService: CacheService,
    private ttsService: TextToSpeechService,
    private router: Router
  ) {
    this.loadAllAssessments();
  }

  public get storedAssessments(): Observable<Assessment[]> {
    return this.storedAssessmentsSource.asObservable();
  }

  public get loadingAssessments(): Observable<boolean> {
    return this.loading.asObservable();
  }

  public async loadAllAssessments(): Promise<void> {
    this.loading.next(true);
    const url = this.router.url;
    const entries = performance.getEntriesByType('navigation');
    const reload = entries.some((entry: PerformanceNavigationTiming) => entry.type === 'reload') && url.includes('/questions/');
    // If no connection or refresh the page while doing an assessment: get cached data
    if (!this.cacheService.networkStatus.getValue() || reload) {
      this.cacheService.getData('assessments').then(
        (cachedAssessments) => {
          this.storedAssessmentsSource.next(cachedAssessments);
          this.loading.next(false);
        }
      );
      return;
    }

    const assessments = await this.getAssessmentsDeep().toPromise();
    for (const assessment of assessments) {
      this.getIcon(assessment.icon);
      for (const questionSet of assessment.question_sets) {
        this.getIcon(questionSet.icon);
        for (const question of questionSet.questions) {
          await this.getQuestionTitleAudio(question, assessment.language);
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

            this.getQuestionDraggableOptions(assessment.id, questionSet.id, question.id).subscribe(
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
      this.cacheService.setData('assessments', assessments);
      this.storedAssessmentsSource.next(assessments);
    }
    this.loading.next(false);
  }

  public getTutorial(): Observable<Assessment> {
    return this.storedAssessments.pipe(
      map(assessmentsList => assessmentsList.find(a => a.subject === 'TUTORIAL'))
    );
  }

  public getAssessments(): Observable<Assessment[]> {
    return this.storedAssessments;
  }

  public getAssessment(assessmentId: number): Observable<Assessment> {
    return this.storedAssessments.pipe(map((assessments) => assessments
        .find(assessment => (assessment.id === assessmentId))));
  }

  public getAssessmentQuestionSets(assessmentId: number): Observable<QuestionSet[]> {
    return this.storedAssessments.pipe(map((assessments) => assessments
        .find(assessment => (assessment.id === assessmentId)).question_sets));
  }

  public getAssessmentQuestionSet(assessmentId: number, questionSetId: number): Observable<QuestionSet> {
    return this.storedAssessments.pipe(map((assessments) => assessments
        .find(assessment => (assessment.id === assessmentId)).question_sets
        .find(questionSet => (questionSet.id === questionSetId))));
  }

  public getAssessmentQuestionSetQuestions(assessmentId: number, questionSetId: number): Observable<GeneralQuestion[]> {
    return this.storedAssessments.pipe(map((assessments) => assessments
        .find(assessment => (assessment.id === assessmentId)).question_sets
        .find(questionSet => (questionSet.id === questionSetId)).questions));
  }

  public getAssessmentQuestionSetQuestion(assessmentId: number, questionSetId: number, questionId: number): Observable<GeneralQuestion> {
    return this.storedAssessments.pipe(map((assessments) => assessments
        .find(assessment => (assessment.id === assessmentId)).question_sets
        .find(questionSet => (questionSet.id === questionSetId)).questions
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
      // TODO: Fix attachment being saved and get as 'http' when they should be served over 'https'
      const path = attachment.file.includes(environment.API_URL) ? attachment.file :
        attachment.file.includes([environment.API_URL.slice(0, 4), environment.API_URL.slice(5, environment.API_URL.length)].join('')) ?
        [attachment.file.slice(0, 4), 's', attachment.file.slice(4)].join('') : environment.API_URL + attachment.file;
      this.http.get(path, { responseType: 'arraybuffer' }).subscribe();
    }
  }

  private async getQuestionTitleAudio(question: GeneralQuestion, language: string): Promise<void> {
    if (!!question.title_audio) { return; }

    const locales = { ENG: 'en-GB', FRE: 'fr-FR', ARA: 'ar-XA' };
    const audioURL = await this.ttsService.getSynthesizedSpeech(locales[language], question.title).toPromise();
    if (audioURL) { question.title_audio = audioURL; }
  }

  private getAssessmentsDeep(): Observable<Assessment[]> {
    return this.http.get<Assessment[]>(`${environment.API_URL}/assessments/get_assessments/`);
  }

  private getQuestionDraggableOptions(assessmentId: number, questionSetId: number, questionId: number): Observable<any> {
    return this.http.get(
      `${environment.API_URL}/assessments/${assessmentId}/question-sets/${questionSetId}/questions/${questionId}/draggable/`
    );
  }
}
