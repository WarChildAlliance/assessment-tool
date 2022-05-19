import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Avatar } from 'src/app/core/models/avatar.model';
import { User } from 'src/app/core/models/user.model';
import { AlertService } from 'src/app/core/services/alert.service';
import { AssisstantService } from 'src/app/core/services/assisstant.service';
import { CacheService } from 'src/app/core/services/cache.service';
import { ProfileService } from 'src/app/core/services/profile.service';
import { TutorialSlideshowService } from 'src/app/core/services/tutorial-slideshow.service';
import { TutorialService } from 'src/app/core/services/tutorial.service';
import { UserService } from 'src/app/core/services/user.service';
import { PageNames } from 'src/app/core/utils/constants';
import { environment } from 'src/environments/environment';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-profile',
    templateUrl: './profile.component.html',
    styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit, AfterViewInit, OnDestroy {
  private readonly pageID = 'profile-page';
  private userSubscription: Subscription;

  public user: User;
  public avatars: Avatar[];

  constructor(
    private route: ActivatedRoute,
    public cacheService: CacheService,
    private profileService: ProfileService,
    private userService: UserService,
    private assisstantService: AssisstantService,
    private alertService: AlertService,
    private tutorialService: TutorialService,
    private tutorialSlideshowService: TutorialSlideshowService,
    private router: Router
    ) { }

  ngOnInit(): void {
    this.assisstantService.setPageID(this.pageID);
    this.route.data.subscribe(
      (data: { user: User }) => {
        this.user = data.user;
        this.avatars = this.user.profile.unlocked_avatars;
      }
    );
    this.userSubscription = this.userService.currentUser.subscribe( res => {
      if (this.cacheService.networkStatus.getValue()) {
        this.user = res;
        this.avatars = res.profile.unlocked_avatars;
      } else {
        this.cacheService.getData('user').then( user => {
          this.user = user;
          this.avatars = user.profile.unlocked_avatars;
        });
      }
    });
    this.tutorialSlideshowService.showTutorialForPage(this.pageID);
  }

  ngAfterViewInit(): void {
    this.tutorialService.currentPage.next(PageNames.profile);
  }

  public getAvatarUrl(avatar: Avatar): string {

    return avatar.image ?
        (environment.API_URL + avatar.image) :
        'assets/icons/Bee.svg';
  }

  public selectAvatar(avatar: Avatar): void {
    avatar.unlocked = true;
    avatar.selected = true;
    avatar.displayCheckMark = true;
    this.cacheService.getData('user').then( user => {
      const newUser = user;
      const unlockAvatar = user.profile.unlocked_avatars.find(a => a.id === avatar.id);
      const effortPoints = this.user.profile.effort;
      const remainingEffort = effortPoints - unlockAvatar.effort_cost;
      const newAvatars = user.profile.unlocked_avatars.map(a => {
        if (a.id === avatar.id) { a.unlocked = true; }
        return a;
      });
      newUser.profile.effort = remainingEffort;
      newUser.profile.unlocked_avatars = newAvatars;
      newUser.profile.current_avatar = avatar;
      newUser.profile.unlocked_avatars.find(av => (av.selected)).selected = false;
      newUser.profile.unlocked_avatars.find(av => (av.id === avatar.id)).selected = true;
      this.cacheService.setData('user', newUser);

      this.profileService.updateProfile(newUser.profile).subscribe();
      this.userService.updateUser(newUser);
    });

  }

  public unlockAvatar(avatar: Avatar): void {
    this.cacheService.getData('user').then( res => {
      const newUser = res;
      const unlockAvatar = res.profile.unlocked_avatars.find(a => a.id === avatar.id);
      if (!unlockAvatar.unlocked) {
        const effortPoints = this.user.profile.effort;
        if (effortPoints < unlockAvatar.effort_cost) {
          this.alertService.error('profile.notEnoughPoints');
        } else {
          avatar.clicked = true;
        }
      } else {
        newUser.profile.current_avatar = avatar;
        newUser.profile.unlocked_avatars.find(av => (av.selected)).selected = false;
        newUser.profile.unlocked_avatars.find(av => (av.id === avatar.id)).selected = true;
        this.cacheService.setData('user', newUser);

        this.profileService.updateProfile(newUser.profile).subscribe();
        this.userService.updateUser(newUser);
      }

    });

  }

  public rewatchTutorial(): void {
    this.tutorialSlideshowService.resetTutorial();
    this.tutorialSlideshowService.startTutorial();
    this.router.navigate(['/']);
  }

  ngOnDestroy(): void {
    this.userSubscription.unsubscribe();
  }
}

