import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
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
  currentUserId: number;

  constructor(
    private http: HttpClient,
    private alertService: AlertService,
    private cookieService: CookieService,
    private router: Router,
    private cacheService: CacheService
  ) {
    this.isAuthenticated = this.cookieService.has('student-auth-token');
  }

  login(username: string): any {
    this.http.post<Token>(`${environment.API_URL}/users/token-auth/`, { username })
    .subscribe(
      (res) => {
        if (res) {
          this.isAuthenticated = true;
          this.currentUserId = res.user_id;
          this.cookieService.set('student-auth-token', res.token);
          this.router.navigate(['']);
        }
      },
      (error) => {
        this.alertService.error(error.error);
      }
    );
  }

  logout(): void {
    this.isAuthenticated = false;
    this.cookieService.delete('student-auth-token');
    this.cookieService.delete('session');
    this.cacheService.deleteData('session');
    this.router.navigate(['/auth']);
  }

  getToken(): string {
    return this.cookieService.get('student-auth-token');
  }


}
