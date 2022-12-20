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

    this.getAssessmentsDeep().subscribe(async assessments => {
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
    if (!!tutorial && !tutorial.all_question_sets_complete) {
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
    console.log('attachment = ', attachments);
    for (const attachment of attachments) {
      console.log('attachment = ', attachment);
      console.log('environ api = ', environment.API_URL);
      console.log('TEST = ', [environment.API_URL.slice(0, 4), 's', environment.API_URL.slice(4)].join(''));
      const path = attachment.file.includes(environment.API_URL) ? attachment.file :
        attachment.file.includes([environment.API_URL.slice(0, 4), 's', environment.API_URL.slice(4)].join('')) ? attachment.file :
        environment.API_URL + attachment.file;
        console.log('path = ', path);
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
