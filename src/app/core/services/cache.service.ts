import { HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { IDBPDatabase, openDB } from 'idb';
import { BehaviorSubject, fromEvent, merge } from 'rxjs';
import { mapTo } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class CacheService {
  private dbName = 'api-storage';

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
        db.createObjectStore('active-session');
        db.createObjectStore('active-session-local');
        db.createObjectStore('active-topic-answer');
        db.createObjectStore('active-topic-answer-local');
      }
    });
  }

  setRequest(request: HttpRequest<unknown>): void {
    this.indexedDbContext().then(db => db.add('mutations', request));
  }

  setData(storeName: string, data: any): void {
    this.indexedDbContext().then(db => db.put(storeName, data, 0));
  }

  getData(storeName: string): Promise<any> {
    return this.indexedDbContext().then(db => db.get(storeName, 0));
  }

  deleteData(storeName: string): void {
    this.indexedDbContext().then(db => db.delete(storeName, 0));
  }
}
