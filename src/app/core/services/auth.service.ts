import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';
import { Token } from '../models/token.model';
import { AlertService } from './alert.service';
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
    private router: Router,
  ) {
    this.isAuthenticated = this.cookieService.has('student-auth-token');
  }

  login(username: string): any {
    this.http.post<Token>(`${environment.API_URL}/users/token-auth/`, { username })
    .subscribe(
      (res) => {
        console.log('user', res);
        if (res) {
          this.isAuthenticated = true;
          this.cookieService.set('student-auth-token', res.token).then( x => {
            if (x) {
              console.log('cookie string', x);
              setTimeout(_ => {
                this.router.navigate(['']);
              }, 3000);
            }
          });
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
    // this.cacheService.deleteAllData();
    this.router.navigate(['/auth']);
  }

  getToken(): string {
    return this.cookieService.get('student-auth-token');
  }


}
