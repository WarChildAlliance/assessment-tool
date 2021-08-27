import { HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { IDBPDatabase, openDB, deleteDB } from 'idb';
import { BehaviorSubject, forkJoin, from, fromEvent, merge, Observable } from 'rxjs';
import { first, map, mapTo } from 'rxjs/operators';
import { AnswerSession } from '../models/answer-session.model';

@Injectable({
  providedIn: 'root'
})
export class CacheService {
  private dbName = 'api-storage';
  private activeSessionStorage = 'active-session';
  private activeSessionLocalStorage = 'active-session-local';

  networkStatus: BehaviorSubject<boolean> = new BehaviorSubject(navigator.onLine);

  constructor() {
    merge(
      fromEvent(window, 'online').pipe(mapTo(true)),
      fromEvent(window, 'offline').pipe(mapTo(false))
    ).subscribe(
      status => this.networkStatus.next(status)
    );
  }

  indexedDbContext(): Promise<IDBPDatabase> {
    return openDB(this.dbName, undefined, {
      upgrade(db): void {
        db.createObjectStore('mutations', { autoIncrement: true });
        db.createObjectStore('assessments');
        db.createObjectStore('active-session');
        db.createObjectStore('active-session-local');
        db.createObjectStore('active-topic-answer');
        db.createObjectStore('active-topic-answer-local');
        db.createObjectStore('active-user');
      }
    });
  }

  setRequest(request: HttpRequest<unknown>): void {
    this.indexedDbContext().then(db => db.add('mutations', request));
  }

  async getRequests(): Promise<{ key: number, value: HttpRequest<unknown> }[]> {
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

  hasActiveSession(): Observable<boolean> {
    return forkJoin([
      from(this.getData(this.activeSessionStorage)),
      from(this.getData(this.activeSessionLocalStorage))
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
