import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { combineLatest, from, Observable, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { Token } from '../models/token.model';
import { AlertService } from './alert.service';
import { CacheService } from './cache.service';
import { CookieService } from './cookie.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  isAuthenticated = false;

  constructor(
    private http: HttpClient,
    private alertService: AlertService,
    private cookieService: CookieService,
    private cacheService: CacheService,
    private router: Router,
  ) {
    this.isAuthenticated = this.cookieService.has('auth-token');
  }

  login(username: string): any {
    combineLatest(
      [this.http.post<Token>(`${environment.API_URL}/users/token-auth/`, { username }),
      this.cacheService.hasActiveSession(),
      from(this.cacheService.getData('active-session'))])
    .subscribe(
      ([res, hasActiveSession, activeSession]) => {
        if (hasActiveSession) {
          if (activeSession.student !== res.user_id) {
            this.cacheService.deleteData('active-session');
            this.cacheService.deleteData('active-topic-answer');
          }
        }
        this.isAuthenticated = true;
        this.cookieService.set('auth-token', res.token);
        this.router.navigate(['']);
      },
      (error) => {
        this.alertService.error(error.error);
      }
    );
  }

  logout(): void {
    this.isAuthenticated = false;
    this.cookieService.delete('auth-token');
    this.router.navigate(['/auth']);
  }

  getToken(): string {
    return this.cookieService.get('auth-token');
  }


}
