import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivate,
  Router,
  RouterStateSnapshot,
  UrlTree,
} from '@angular/router';
import { UserService } from './core/services/user.service';

@Injectable({
  providedIn: 'root',
})
export class IntroGuard implements CanActivate {
  constructor(private router: Router, private userService: UserService) {}

  async canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot,
  ): Promise<boolean | UrlTree> {
    const { see_intro } = await this.userService.getUser().toPromise();

    if (see_intro) {
      return this.router.parseUrl('/intro');
    } else {
      return true;
    }
  }
}
