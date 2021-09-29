import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import * as moment from 'moment';
import { from, Observable, of } from 'rxjs';
import { switchMap, tap } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { AnswerSession } from '../models/answer-session.model';
import { GeneralAnswer } from '../models/answer.model';
import { TopicAnswer } from '../models/topic-answer.model';
import { CacheService } from './cache.service';
import { UserService } from './user.service';

@Injectable({
  providedIn: 'root'
})
export class AnswerService {
  private activeSessionStorage = 'session';
  private activeTopicAnswerStorage = 'topic-answer';


  constructor(
    private http: HttpClient,
    private cacheService: CacheService,
    private userService: UserService,
  ) { }

  startSession(): Observable<AnswerSession> {
     return this.createSession();
  }


  startTopicAnswer(topicId: number): Observable<any> {
    this.cacheService.getData(this.activeSessionStorage).then(res => {
    });

    const topicAnswer: TopicAnswer = {
      topic: topicId,
      start_date: moment().format(),
      end_date: null,
      answers: [],
    };

    this.cacheService.setData(this.activeTopicAnswerStorage, topicAnswer);
    return from(this.cacheService.getData(this.activeTopicAnswerStorage));
  }

  submitAnswer(answer: GeneralAnswer, topicId?: number): Observable<any> {
    return from(this.cacheService.getData(this.activeTopicAnswerStorage).then( topicAnswers => {
      topicAnswers.answers.push(answer);
      this.cacheService.setData(this.activeTopicAnswerStorage, topicAnswers);
    }));
  }

  endTopicAnswer(): Observable<any> {
    return from(this.cacheService.getData(this.activeTopicAnswerStorage).then( cachedAnswers => {
      this.cacheService.getData(this.activeSessionStorage).then( res => {
        cachedAnswers.session = res.id;
        cachedAnswers.end_date = moment().format();
        this.http.post<TopicAnswer>(`${environment.API_URL}/answers/${this.userService.user.id}/topics/create_all/`,
        { cachedAnswers }).subscribe();
        this.cacheService.deleteData(this.activeTopicAnswerStorage);
      });
    }));
  }

  endSession(): Observable<AnswerSession> {
    return from(this.cacheService.getData(this.activeSessionStorage)).pipe(
      switchMap((activeSessionLocal: AnswerSession) => {
        if (activeSessionLocal) {
          activeSessionLocal.end_date = moment().format();
          this.cacheService.deleteData(this.activeSessionStorage);
          return this.createSessionFull(activeSessionLocal);
        } else {
          return from(this.cacheService.getData(this.activeSessionStorage)).pipe(
            switchMap(session => {
              if (session) {
                return this.updateSession(session.id, moment()).pipe(
                  tap(_ => this.cacheService.deleteData(this.activeSessionStorage))
                );
              } else {
                return of(null);
              }
            })
          );
        }
      })
    );
  }

  private createSession(): Observable<AnswerSession> {
    return this.http.post<AnswerSession>(
      `${environment.API_URL}/answers/${this.userService.user.id}/sessions/`,
      { student: this.userService.user.id, duration: '' }
    ).pipe(
      tap(session => this.cacheService.setData(this.activeSessionStorage, session))
    );
  }

  private createSessionFull(data: AnswerSession): Observable<AnswerSession> {
    return this.http.post<AnswerSession>(
      `${environment.API_URL}/answers/${this.userService.user.id}/sessions/create_all/`,
      data
    );
  }

  private updateSession(sessionId: number, endDate: moment.Moment): Observable<AnswerSession> {
    return this.http.put<AnswerSession>(`${environment.API_URL}/answers/${this.userService.user.id}/sessions/${sessionId}/`,
      { end_date: endDate.format() });
  }

  public getCompleteStudentAnswersForTopic(topicId: number): Observable<any[]> {
    return this.http.get<any[]>(`${environment.API_URL}/answers/${this.userService.user.id}/topics/?complete=true&topic_access__topic=${topicId}`);
  }
}
