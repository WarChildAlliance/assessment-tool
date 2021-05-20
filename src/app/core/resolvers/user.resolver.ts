import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot, Resolve,
  Router,
  RouterStateSnapshot
} from '@angular/router';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { User } from '../models/user.model';
import { UserService } from '../services/user.service';

@Injectable({
  providedIn: 'root'
})
export class UserResolver implements Resolve<User> {
  constructor(
    private userService: UserService,
    private router: Router
  ) { }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<User> | User {
    if (!!this.userService.user) {
      return this.userService.user;
    }

    return this.userService.getSelf().pipe(
      catchError(err => {
        this.router.navigate(['auth']);
        return throwError(err);
      })
    );
  }
}
