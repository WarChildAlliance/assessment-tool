import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot, Resolve,
  Router,
  RouterStateSnapshot
} from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { User } from '../models/user.model';
import { AlertService } from '../services/alert.service';
import { AuthService } from '../services/auth.service';
import { UserService } from '../services/user.service';

@Injectable({
  providedIn: 'root'
})
export class UserResolver implements Resolve<User> {
  constructor(
    private userService: UserService,
    private router: Router,
    private authService: AuthService,
    private alertService: AlertService,
    private translateService: TranslateService
  ) { }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<User> | User {
    if (!!this.userService.user) {
      return this.userService.user;
    }

    return this.userService.getSelf().pipe(
      catchError(err => {

        // To handle unauthorized access to user details: the previously logged in student has been deleted
        if (err.status === 401) {
          this.authService.logout();
          this.alertService.error(this.translateService.instant('auth.studentNotFound'));
        }

        this.router.navigate(['auth']);
        return throwError(err);
      })
    );
  }
}
