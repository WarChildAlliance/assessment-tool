import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { from } from 'rxjs';
import { Avatar } from 'src/app/core/models/avatar.model';
import { User } from 'src/app/core/models/user.model';
import { AlertService } from 'src/app/core/services/alert.service';
import { AssisstantService } from 'src/app/core/services/assisstant.service';
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
  private readonly pageID = 'profile-page';

  user: User;
  avatars: Avatar[];

  constructor(
    private route: ActivatedRoute,
    public cacheService: CacheService,
    private profileService: ProfileService,
    private userService: UserService,
    private assisstantService: AssisstantService,
    private alertService: AlertService,
  ) { }

  ngOnInit(): void {
    this.assisstantService.setPageID(this.pageID);
    this.route.data.subscribe(
      (data: { user: User }) => {
        this.user = data.user;
        this.avatars = this.user.profile.unlocked_avatars;
      }
    );
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
    this.cacheService.getData('active-user').then( res => {
      const unlockAvatar = res.profile.unlocked_avatars.find(a => a.id === avatar.id);
      if (!unlockAvatar.unlocked) {
        const effortPoints = this.user.profile.effort;
        if (effortPoints < unlockAvatar.effort_cost) {
          this.alertService.error('You dont have enough points');
        } else {
          const remainingEffort = effortPoints - unlockAvatar.effort_cost;
          const newAvatars = res.profile.unlocked_avatars.map(a => {
            if (a.id === avatar.id) { a.unlocked = true; }
            return a;
          });
          const newUser = this.user;
          newUser.profile.effort = remainingEffort;
          newUser.avatars = newAvatars;

          this.cacheService.setData('active-user', newUser);
          this.profileService.updateProfile(newUser.profile).subscribe (response => {
            console.log('TODO show success message', response);
          });
          this.userService.updateUser(newUser);
        }
      }

    });

  }
}
