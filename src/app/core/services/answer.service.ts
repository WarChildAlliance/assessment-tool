import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import * as moment from 'moment';
import { combineLatest, forkJoin, from, Observable, of } from 'rxjs';
import { first, map, switchMap, tap } from 'rxjs/operators';
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
  private activeSessionStorage = 'active-session';
  private activeSessionLocalStorage = 'active-session-local';
  private activeTopicAnswerStorage = 'active-topic-answer';
  private activeTopicAnswerLocalStorage = 'active-topic-answer-local';

  constructor(
    private http: HttpClient,
    private cacheService: CacheService,
    private userService: UserService,
  ) { }

  startSession(): Observable<AnswerSession> {
    return this.cacheService.networkStatus.pipe(
      switchMap(online => {
        if (online) {
          return this.createSession();
        } else {
          const session: AnswerSession = {
            student: this.userService.user.id,
            start_date: moment().format(),
            end_date: null,
            assessment_topic_answers: []
          };
          this.cacheService.setData(this.activeSessionLocalStorage, session);
          return of(session);
        }
      }),
      first()
    );
  }


  startTopicAnswer(topicId: number): Observable<TopicAnswer> {
    return combineLatest([
      this.cacheService.networkStatus,
      from(this.cacheService.getData(this.activeSessionLocalStorage))
    ]).pipe(
      switchMap(([online, activeSessionLocal]: [boolean, AnswerSession]) => {
        if (online && activeSessionLocal) {
          // If network on and local session exists, add session to API and then add topic answer to API
          return this.createSessionFull(activeSessionLocal).pipe(
            switchMap(session => {
              this.cacheService.deleteData(this.activeSessionLocalStorage);
              this.cacheService.setData(this.activeSessionStorage, session);
              return this.createTopicAnswer(topicId, session.id);
            })
          );
        } else if (online) {
          // If network on and no local session exists, add topic answer to API
          return from(this.cacheService.getData(this.activeSessionStorage)).pipe(
            switchMap(session => this.createTopicAnswer(topicId, session.id))
          );
        } else if (!online && activeSessionLocal) {
          // If network off and local session exists, add topic answer to local session
          const topicAnswer: TopicAnswer = {
            topic: topicId,
            start_date: moment().format(),
            end_date: null,
            answers: []
          };
          activeSessionLocal.assessment_topic_answers.push(topicAnswer);
          this.cacheService.setData(this.activeSessionLocalStorage, activeSessionLocal);
          return of(topicAnswer);
        } else {
          // If network off and no local session exists, get session id and add local topic answer
          return from(this.cacheService.getData(this.activeSessionStorage)).pipe(
            map((data: AnswerSession) => {
              const topicAnswer: TopicAnswer = {
                topic: topicId,
                start_date: moment().format(),
                end_date: null,
                session: data.id,
                answers: []
              };
              this.cacheService.setData(this.activeTopicAnswerLocalStorage, topicAnswer);
              return topicAnswer;
            })
          );
        }
      }),
      first()
    );
  }

  submitAnswer(answer: GeneralAnswer, topicId?: number): Observable<GeneralAnswer> {
    return combineLatest([
      this.cacheService.networkStatus,
      from(this.cacheService.getData(this.activeSessionLocalStorage)),
      from(this.cacheService.getData(this.activeTopicAnswerLocalStorage))
    ]).pipe(
      switchMap(([online, activeSessionLocal, activeTopicAnswerLocal]: [boolean, AnswerSession, TopicAnswer]) => {
        if (online && activeSessionLocal) {
          // If network on and local session exists, add add session to API, set active session and topic answer and then add answer to API
          return this.createSessionFull(activeSessionLocal).pipe(
            switchMap(session => {
              const activeTopic = session.assessment_topic_answers[session.assessment_topic_answers.length - 1];
              this.cacheService.deleteData(this.activeSessionLocalStorage);
              this.cacheService.setData(this.activeSessionStorage, session);
              this.cacheService.setData(this.activeTopicAnswerStorage, activeTopic);
              return this.createAnswer({ ...answer, topic_answer: activeTopic.id });
            })
          );
        } else if (online && activeTopicAnswerLocal) {
          // If network on and local topic answer exists, add topic answer to API and then add answer to API
          // TODO: Check here if we need createTopicAnswer instead
          return this.createTopicAnswerFull(activeTopicAnswerLocal).pipe(
            switchMap(topicAnswer => {
              this.cacheService.deleteData(this.activeTopicAnswerLocalStorage);
              this.cacheService.setData(this.activeTopicAnswerStorage, topicAnswer);
              return this.createAnswer({ ...answer, topic_answer: topicAnswer.id });
            })
          );
        } else if (!online && activeSessionLocal) {
          // If not network on and local session exists, add answer to last topic answer in local session
          const activeTopic = activeSessionLocal.assessment_topic_answers[activeSessionLocal.assessment_topic_answers.length - 1];
          activeTopic.answers.push(answer);
          this.cacheService.setData(this.activeSessionLocalStorage, activeSessionLocal);
          return of(answer);
        } else if (!online && activeTopicAnswerLocal) {
          // If not network on and local topic answer exists, add answer to topic answer
          activeTopicAnswerLocal.answers.push(answer);
          this.cacheService.setData(this.activeTopicAnswerLocalStorage, activeTopicAnswerLocal);
          return of(answer);
        } else if (!online && !activeTopicAnswerLocal) {
          return from(this.cacheService.getData(this.activeSessionStorage)).pipe(
            map((data: AnswerSession) => {
              const topicAnswer: TopicAnswer = {
                topic: topicId,
                start_date: moment().format(),
                end_date: null,
                session: data.id,
                answers: [answer]
              };
              this.cacheService.setData(this.activeTopicAnswerLocalStorage, topicAnswer);
              return answer;
            }),
          );
        }
        else {

          // TODO here we set the answers always to the activeTopicAnswerStorage but doesnt seem to be the best solution
          this.cacheService.getData(this.activeTopicAnswerStorage).then( activeTopicAnswer => {
            const updatedActiveTopicAnswer = activeTopicAnswer;
            updatedActiveTopicAnswer.answers.push(answer);
            this.cacheService.setData(this.activeTopicAnswerStorage, updatedActiveTopicAnswer);
          });

          // Send request with active topic answer (online or offline)
          return from(this.cacheService.getData(this.activeTopicAnswerStorage)).pipe(
            switchMap((data: TopicAnswer) => this.createAnswer({ ...answer, topic_answer: data.id }))
          );
        }
      }),
      first()
    );
  }

  endTopicAnswer(): Observable<TopicAnswer> {
    return combineLatest([
      this.cacheService.networkStatus,
      from(this.cacheService.getData(this.activeSessionLocalStorage)),
      from(this.cacheService.getData(this.activeTopicAnswerLocalStorage))
    ]).pipe(
      switchMap(([online, activeSessionLocal, activeTopicAnswerLocal]: [boolean, AnswerSession, TopicAnswer]) => {
        if (activeSessionLocal) {
          const activeTopic = activeSessionLocal.assessment_topic_answers[activeSessionLocal.assessment_topic_answers.length - 1];
          activeTopic.end_date = moment().format();
          if (online) {
            // If network on and local session exists, add end_date to last topic answer and add session in API
            return this.createSessionFull(activeSessionLocal).pipe(
              tap(session => {
                this.cacheService.setData(this.activeSessionStorage, session);
                this.cacheService.deleteData(this.activeSessionLocalStorage);
              }),
              map(session => session.assessment_topic_answers[session.assessment_topic_answers.length - 1])
            );
          } else {
            // If no network on and local session exists, add end_date to last topic answer
            this.cacheService.setData(this.activeSessionLocalStorage, activeSessionLocal);
            return of(activeTopic);
          }
        } else if (activeTopicAnswerLocal) {
          // If local topic answer exists, add end_date to topic answer and add topic answer to API
          // TODO Refactor - this is a ugly solution. activeTopicAnswerLocal seems not to have the latest value
          return from(this.cacheService.getData(this.activeTopicAnswerLocalStorage)).pipe(
            switchMap((topicAnswer: TopicAnswer) => {
              if (topicAnswer) {
                activeTopicAnswerLocal.end_date = moment().format();
                this.cacheService.deleteData(this.activeSessionLocalStorage);
                this.cacheService.deleteData(this.activeTopicAnswerLocalStorage);
                return this.createTopicAnswerFull(activeTopicAnswerLocal);
              } else {
                return of(null);
              }
            })
          );
        } else {
          // If no local data exists, update topic_answer in API
          return from(this.cacheService.getData(this.activeTopicAnswerStorage)).pipe(
            switchMap((topicAnswer: any) => {
              if (topicAnswer) {
                return this.updateTopicAnswer(topicAnswer.id, moment(), topicAnswer.topic_competency).pipe(
                  tap(_ => this.cacheService.deleteData(this.activeTopicAnswerStorage))
                );
              } else {
                this.endSession();
                return of(null);
              }
            })
          );
        }
      }),
      first()
    );
  }

  endSession(): Observable<AnswerSession> {
    return from(this.cacheService.getData(this.activeSessionLocalStorage)).pipe(
      switchMap((activeSessionLocal: AnswerSession) => {
        if (activeSessionLocal) {
          activeSessionLocal.end_date = moment().format();
          this.cacheService.deleteData(this.activeSessionLocalStorage);
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

  private createTopicAnswer(topicId: number, sessionId: number): Observable<TopicAnswer> {
    console.log(1);
    return this.http.post<TopicAnswer>(
      `${environment.API_URL}/answers/${this.userService.user.id}/topics/`,
      { topic: topicId, session: sessionId }
    ).pipe(
      tap(topicAnswer => {
        this.cacheService.setData(this.activeTopicAnswerStorage, {...topicAnswer, answers: []});
      })
    );
  }

  private createTopicAnswerFull(data: TopicAnswer): Observable<TopicAnswer> {
    console.log(2);
    return this.http.post<TopicAnswer>(`${environment.API_URL}/answers/${this.userService.user.id}/topics/create_all/`, data);
  }

  private updateTopicAnswer(topicAnswerId: number, endDate: moment.Moment, topicCompetency?: number): Observable<TopicAnswer> {
    console.log('Result', topicCompetency);
    return this.http.put<TopicAnswer>(`${environment.API_URL}/answers/${this.userService.user.id}/topics/${topicAnswerId}/`,
      { end_date: endDate.format(), topic_competency: topicCompetency ? topicCompetency : 0 });
  }

  private createAnswer(data: GeneralAnswer): Observable<GeneralAnswer> {
    return this.http.post<GeneralAnswer>(`${environment.API_URL}/answers/${this.userService.user.id}/`, data);
  }

  public getCompleteStudentAnswersForTopic(topicId: number): Observable<any[]> {
    return this.http.get<any[]>(`${environment.API_URL}/answers/${this.userService.user.id}/topics/?complete=true&topic_access__topic=${topicId}`);
  }
}
