import { Injectable } from '@angular/core';
import {CanLoad, Route, Router, UrlSegment, UrlTree} from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';
import {LoginCodeRegex} from '../../constants/regex.constant';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanLoad {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canLoad(
    route: Route,
    segments: UrlSegment[]): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
      if (!route.path.includes('auth') && !this.authService.isAuthenticated) {
        return this.router.parseUrl('auth');
      }
      if (route.path.includes('auth')) {
          const queryParams = this.router.getCurrentNavigation().extractedUrl.queryParams;
          const {code} = queryParams as { code?: string };
          if (!!code && LoginCodeRegex.test(code)) { // if a valid code is passed in queryParams then we force logout the existing student
              this.authService.logout(true);
              return true;
          }
          if (this.authService.isAuthenticated) {
              return this.router.parseUrl('');
          }
      }
      return true;
  }
}
