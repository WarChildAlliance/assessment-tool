import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Avatar } from 'src/app/core/models/avatar.model';
import { User } from 'src/app/core/models/user.model';
import { CacheService } from 'src/app/core/services/cache.service';
import { ProfileService } from 'src/app/core/services/profile.service';
import { UserService } from 'src/app/core/services/user.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {

  user: User;
  avatars: Avatar[];

  constructor(
    private route: ActivatedRoute,
    public cacheService: CacheService,
    private profileService: ProfileService,
    private userService: UserService
  ) { }

  ngOnInit(): void {
    this.route.data.subscribe(
      (data: { user: User }) => this.user = data.user
    );
    this.profileService.getAvatarsList().subscribe(avatars => {
      this.avatars = avatars;
    });
  }

  getAvatarUrl(avatar: Avatar): string {

    // TODO We should replace by a real default image so the students can understand it's not the expected one
    const imageUrl = avatar.image ?
      (environment.API_URL + avatar.image) :
      'assets/icons/Bee.svg';

    return imageUrl;
  }

  selectAvatar(avatar: Avatar): void {
    this.profileService.selectNewAvatar(avatar.id).subscribe(
      (newAvatar) => {
        this.avatars.find(av => (av.selected)).selected = false;
        this.avatars.find(av => (av.id === newAvatar.id)).selected = true;

        this.userService.getSelf().subscribe((user) => { this.user = user; });
      }
    );
  }

  unlockAvatar(avatar: Avatar): void {
    this.profileService.unlockAvatar(avatar.id).subscribe(
      (newAvatar) => {
        this.avatars.find((av) => (av.id === newAvatar.id)).unlocked = true;

        this.userService.getSelf().subscribe((user) => { this.user = user; });
      }
    );
  }
}
