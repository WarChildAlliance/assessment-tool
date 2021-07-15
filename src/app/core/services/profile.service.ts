import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { Avatar } from '../models/avatar.model';
import { CacheService } from './cache.service';

@Injectable({
  providedIn: 'root'
})
export class ProfileService {


  constructor(
    private http: HttpClient,
    private cacheService: CacheService
  ) {}

  /*activeProfile(): Observable<any> {
    return this.cacheService.networkStatus.pipe(
      switchMap(online => {
        if (online) {
          // we create a user session
          // it will be used for gamification elements, in case we are offline

          this.profileService.getAvatarsList().subscribe(avatars => {
            this.avatars = avatars;
          });
          const activeUser: any = {
            student: this.userService.user.id,
          };
          this.cacheService.setData(this.activeSessionLocalStorage, activeUser);
          return of(activeUser);
          //return this.createSession();
        } else {

        }
      }),
      first()
    );
  }*/

  public getAvatarsList(): Observable<Avatar[]> {
    return this.http.get<Avatar[]>(`${environment.API_URL}/gamification/avatars/`);
  }

  public selectNewAvatar(avatarId: number): Observable<Avatar> {
    return this.http.post<Avatar>(`${environment.API_URL}/gamification/avatars/select/`, {
      avatar_id : avatarId
    });
  }

  public unlockAvatar(avatarId: number): Observable<Avatar> {

    return this.http.post<Avatar>(`${environment.API_URL}/gamification/avatars/unlock/`, {
      avatar_id : avatarId
    });
  }
}
