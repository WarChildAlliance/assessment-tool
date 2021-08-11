import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, forkJoin, Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { Avatar } from '../models/avatar.model';
import { Profile } from '../models/profile.model';
import { CacheService } from './cache.service';
import { User, UserRoles } from '../models/user.model';
import { AuthService } from './auth.service';
import { LanguageService } from './language.service';

@Injectable({
    providedIn: 'root'
})
export class UserService {


  private userSource = new BehaviorSubject<User>(null);
  currentUser = this.userSource.asObservable();

  user: User;

  constructor(
    private http: HttpClient,
    private languageService: LanguageService,
    private cacheService: CacheService,
    private authService: AuthService
  ) { }

  getSelf(): Observable<User> {
    return forkJoin ( {
      user: this.http.get<User>(`${environment.API_URL}/users/get_self/`),
      profile: this.http.get<Profile>(`${environment.API_URL}/gamification/profiles/get_self/`),
      avatars: this.http.get<Avatar[]>(`${environment.API_URL}/gamification/avatars/`)
    }).pipe(
      map(
        res => {
          if (res.user.role !== UserRoles.Student) { this.authService.logout(); }
          res.user.profile = res.profile;
          res.user.profile.unlocked_avatars = res.avatars;
          return res.user;
      }),
      tap(user => {
        this.user = user;
        if (this.cacheService.networkStatus.getValue()) {
          this.cacheService.setData('active-user', user);
        }
        this.userSource.next(user);
        this.languageService.setLanguage(user.language);
      })
    );
  }

  updateUser(user: User): void {
    this.user = user;
    this.userSource.next(user);
  }


  resetUser(): void {
    this.user = null;
    this.userSource.next(null);
  }
}
