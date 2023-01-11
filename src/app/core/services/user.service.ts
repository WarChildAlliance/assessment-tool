import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, forkJoin, Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { CacheService } from './cache.service';
import { User, UserRoles } from '../models/user.model';
import { AuthService } from './auth.service';
import { LanguageService } from './language.service';

@Injectable({
    providedIn: 'root'
})
export class UserService {

  public userSource = new BehaviorSubject<User>(null);

  public currentUser = this.userSource.asObservable();

  public user: User;


  constructor(
    private http: HttpClient,
    private languageService: LanguageService,
    private cacheService: CacheService,
    private authService: AuthService
  ) { }

  public getSelf(): Observable<User> {
    if (!this.cacheService.networkStatus.getValue()) {
      this.cacheService.getData('user').then( activeUser => {
        if (activeUser){
          this.updateUser(activeUser);
        }
      });
      return this.currentUser;
    }
    return forkJoin ( {
      // user: this.http.get<User>(`${environment.API_URL}/users/${this.authService.currentUserId}/`),
      user: this.http.get<User>(`${environment.API_URL}/users/get_self/`),
    }).pipe(
      map(
        res => {
          if (res.user.role !== UserRoles.Student) { this.authService.logout(); }
          return res.user;
      }),
      tap(user => {
        this.user = user;
        if (this.cacheService.networkStatus.getValue()) {
          this.cacheService.setData('user', user);
        }
        this.userSource.next(user);
        this.languageService.setLanguage(user.language);
      })
    );
  }

  public getUser(): Observable<User> {
    return this.http.get<User>(`${environment.API_URL}/users/get_self/`);
  }

  public updateUser(user: User): void {
    this.user = user;
    this.userSource.next(user);
    if (this.cacheService.networkStatus.getValue()) {
      this.cacheService.setData('user', user);
    }
  }

  public resetUser(): void {
    this.user = null;
    this.userSource.next(null);
  }

  public updateUserNoCache(user: Partial<User>): Observable<User> {
    return this.http.put<User>(`${environment.API_URL}/users/${user.id}/`, user);
  }
}
