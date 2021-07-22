import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
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
    this.userService.currentUser.subscribe( res => {
      if (this.cacheService.networkStatus.getValue()) {
        this.user = res;
        this.avatars = res.profile.unlocked_avatars;
      } else {
        this.cacheService.getData('active-user').then( user => {
          this.user = user;
          this.avatars = user.profile.unlocked_avatars;
        });
      }
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
    const newUser = {...this.user};
    newUser.profile.current_avatar = avatar;
    newUser.profile.unlocked_avatars.find(av => (av.selected)).selected = false;
    newUser.profile.unlocked_avatars.find(av => (av.id === avatar.id)).selected = true;

    this.cacheService.setData('active-user', newUser);
    this.userService.updateUser(newUser);
    this.profileService.updateProfile(newUser.profile).subscribe (response => {
      console.log('TODO show success message', response);
    });

    this.profileService.selectNewAvatar(avatar.id).subscribe(
      (newAvatar) => {
        console.log('TODO remove this part. should be taken care of in update profile.', newAvatar);
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
          newUser.profile.unlocked_avatars = newAvatars;

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
