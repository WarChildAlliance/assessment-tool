import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { forkJoin, Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { Profile } from '../models/profile.model';
import { User } from '../models/user.model';
import { LanguageService } from './language.service';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  user: User;

  constructor(
    private http: HttpClient,
    private languageService: LanguageService
  ) { }

  getSelf(): Observable<User> {
    return forkJoin ( {
      user: this.http.get<User>(`${environment.API_URL}/users/get_self/`),
      profile: this.http.get<Profile>(`${environment.API_URL}/gamification/profiles/get_self/`)
    }).pipe(
      map(
        res => {
          res.user.profile = res.profile;
          return res.user;
      }),
      tap(user => {
        this.user = user;
        this.languageService.setLanguage(user.language);
      })
    );
  }

  resetUser(): void {
    this.user = null;
  };
}
