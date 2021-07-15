import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { forkJoin, Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { Avatar } from '../models/avatar.model';
import { Profile } from '../models/profile.model';
import { User } from '../models/user.model';
import { CacheService } from './cache.service';
import { LanguageService } from './language.service';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  user: User;

  constructor(
    private http: HttpClient,
    private languageService: LanguageService,
    private cacheService: CacheService,
  ) { }

  getSelf(): Observable<User> {
    return forkJoin ( {
      user: this.http.get<User>(`${environment.API_URL}/users/get_self/`),
      profile: this.http.get<Profile>(`${environment.API_URL}/gamification/profiles/get_self/`),
      avatars: this.http.get<Avatar[]>(`${environment.API_URL}/gamification/avatars/`)
    }).pipe(
      map(
        res => {
          res.user.profile = res.profile;
          res.user.avatars = res.avatars;
          return res.user;
      }),
      tap(user => {
        this.user = user;
        this.cacheService.setData('active-user', user);
        this.languageService.setLanguage(user.language);
      })
    );
  }

  resetUser(): void {
    this.user = null;
  }
}
