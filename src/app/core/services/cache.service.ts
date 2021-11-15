import { HttpClient, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { IDBPDatabase, openDB, deleteDB } from 'idb';
import { BehaviorSubject, forkJoin, from, fromEvent, interval, merge, Observable, Observer } from 'rxjs';
import { first, map, throttle } from 'rxjs/operators';
import { AnswerSession } from '../models/answer-session.model';

@Injectable({
  providedIn: 'root'
})
export class CacheService {
  private dbName = 'api-storage-la';
  private activeSessionStorage = 'session';

  networkStatus: BehaviorSubject<boolean> = new BehaviorSubject(navigator.onLine);

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

  private sendStoredMutations(): void {
    from(this.getRequests()).subscribe((requests: { key: number, value: HttpRequest<unknown> }[]) => {
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



  indexedDbContext(): Promise<IDBPDatabase> {
    deleteDB('api-storage');
    return openDB(this.dbName, undefined, {
      upgrade(db): void {
        db.createObjectStore('mutations', { autoIncrement: true });
        db.createObjectStore('assessments');
        db.createObjectStore('session');
        db.createObjectStore('topic-answer');
        db.createObjectStore('user');
      }
    });
  }

  setRequest(request: HttpRequest<unknown>): void {
    this.indexedDbContext().then(db => db.add('mutations', request));
  }

  async getRequests(): Promise<{ key: number, value: HttpRequest<unknown> }[]> {
    const allTest = this.indexedDbContext().then(db => db.getAll('mutations'));
    let cursor = await this.indexedDbContext().then(db => db.transaction('mutations').store.openCursor());
    const requests: { key: number, value: HttpRequest<unknown> }[] = [];
    while (cursor) {
      requests.push({ key: cursor.key as number, value: cursor.value });
      cursor = await cursor.continue();
    }
    return requests;
  }

  deleteRequest(key: number): void {
    this.indexedDbContext().then(db => db.delete('mutations', key));
  }

  setData(storeName: string, data: any): void {
    this.indexedDbContext().then(db => db.put(storeName, data, 0));
  }

  getData(storeName: string): Promise<any> {
    return this.indexedDbContext().then(db => db.get(storeName, 0));
  }

  getSingleData(storeName: string, keyPath: string): Promise<any> {
    return this.indexedDbContext().then(db => db.transaction(storeName).objectStore(storeName).get(keyPath));
  }

  deleteData(storeName: string): void {
    this.indexedDbContext().then(db => db.delete(storeName, 0));
  }

  deleteAllData(): void {
    deleteDB('api-storage-la');
  }

  hasActiveSession(): Observable<boolean> {
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
}
