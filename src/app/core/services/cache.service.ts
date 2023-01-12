/* eslint-disable prefer-arrow/prefer-arrow-functions */
import { HttpClient, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { IDBPDatabase, openDB, deleteDB } from 'idb';
import { BehaviorSubject, forkJoin, from, fromEvent, interval, Observable } from 'rxjs';
import { first, map, throttle } from 'rxjs/operators';
import { AnswerSession } from '../models/answer-session.model';

@Injectable({
  providedIn: 'root'
})
export class CacheService {

  public networkStatus: BehaviorSubject<boolean> = new BehaviorSubject(navigator.onLine);

  private dbName = 'api-storage';
  private activeSessionStorage = 'session';

  constructor(private http: HttpClient) {

    fromEvent(window, 'offline')
    .pipe(throttle(ev => interval(2000))).subscribe( status => {
      this.networkStatus.next(false);
    });
    fromEvent(window, 'online')
    .pipe(throttle(ev => interval(2000))).subscribe( status => {
      this.networkStatus.next(true);
      this.sendStoredMutations();
    });
  }

  public setRequest(request: HttpRequest<unknown>): void {
    this.indexedDbContext().then(db => db.add('mutations', request));
  }

  public async getRequests(): Promise<{ key: number; value: HttpRequest<unknown> }[]> {
    let cursor = await this.indexedDbContext().then(db => db.transaction('mutations').store.openCursor());
    const requests: { key: number; value: HttpRequest<unknown> }[] = [];
    while (cursor) {
      requests.push({ key: cursor.key as number, value: cursor.value });
      cursor = await cursor.continue();
    }
    return requests;
  }

  public deleteRequest(key: number): void {
    this.indexedDbContext().then(db => db.delete('mutations', key));
  }

  public setData(storeName: string, data: any): void {
    this.indexedDbContext().then(db => db.put(storeName, data, 0));
  }

  public getData(storeName: string): Promise<any> {
    return this.indexedDbContext().then(db => db.get(storeName, 0));
  }

  public getSingleData(storeName: string, keyPath: string): Promise<any> {
    return this.indexedDbContext().then(db => db.transaction(storeName).objectStore(storeName).get(keyPath));
  }

  public deleteData(storeName: string): void {
    this.indexedDbContext().then(db => db.delete(storeName, 0));
  }

  public deleteAllData(): void {
    deleteDB('api-storage');
  }

  public hasActiveSession(): Observable<boolean> {
    return forkJoin([
      from(this.getData(this.activeSessionStorage)),
      from(this.getData(this.activeSessionStorage))
    ]).pipe(
      map(([activeSession, activeSessionLocal]: [AnswerSession, AnswerSession]) => {
        if (activeSession || activeSessionLocal) {
          return true;
        }
        return false;
      }),
      first()
    );
  }

  private sendStoredMutations(): void {
    from(this.getRequests()).subscribe((requests: { key: number; value: HttpRequest<unknown> }[]) => {
        for (const request of requests) {
            let requestToSend: Observable<any> = null;
            if (request.value.method === 'POST') {
                requestToSend = this.http.post(request.value.urlWithParams, request.value.body);
            } else if (request.value.method === 'PUT') {
                requestToSend = this.http.put(request.value.urlWithParams, request.value.body);
            } else if (request.value.method === 'DELETE') {
                requestToSend = this.http.delete(request.value.urlWithParams);
            }

            if (requestToSend) {
                requestToSend.subscribe((_) => {
                    this.deleteRequest(request.key);
                });
            }
        }
    });
  }

  private indexedDbContext(): Promise<IDBPDatabase> {
    return openDB(this.dbName, undefined, {
      upgrade(db): void {
        db.createObjectStore('mutations', { autoIncrement: true });
        db.createObjectStore('assessments');
        db.createObjectStore('session');
        // TODO: Find out why we can't change topic-answer to question-set-answer
        // In the objectStoreNames, it stays as topic-answer
        db.createObjectStore('topic-answer');
        db.createObjectStore('user');
      }
    });
  }
}
