import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Avatar } from '../models/avatar.model';

@Injectable({
  providedIn: 'root'
})
export class ProfileService {

  constructor(
    private http: HttpClient,
  ) {}

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
