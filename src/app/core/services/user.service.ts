import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
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
    return this.http.get<User>(`${environment.API_URL}/users/get_self/`).pipe(
      tap(user => {
        this.user = user;
        this.languageService.setLanguage(user.language);
      })
    );
  }
}
