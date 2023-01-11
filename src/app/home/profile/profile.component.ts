import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { User } from 'src/app/core/models/user.model';
import { CacheService } from 'src/app/core/services/cache.service';
import { TutorialSlideshowService } from 'src/app/core/services/tutorial-slideshow.service';
import { TutorialService } from 'src/app/core/services/tutorial.service';
import { UserService } from 'src/app/core/services/user.service';
import { PageNames } from 'src/app/core/utils/constants';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-profile',
    templateUrl: './profile.component.html',
    styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit, AfterViewInit, OnDestroy {

  public user: User;

  private readonly pageID = 'profile-page';
  private userSubscription: Subscription;

  constructor(
    private route: ActivatedRoute,
    public cacheService: CacheService,
    private userService: UserService,
    private tutorialService: TutorialService,
    private tutorialSlideshowService: TutorialSlideshowService,
    private router: Router
    ) { }

  ngOnInit(): void {
    this.route.data.subscribe(
      (data: { user: User }) => {
        this.user = data.user;
      }
    );
    this.userSubscription = this.userService.currentUser.subscribe( res => {
      if (this.cacheService.networkStatus.getValue()) {
        this.user = res;
      } else {
        this.cacheService.getData('user').then( user => {
          this.user = user;
        });
      }
    });
    this.tutorialSlideshowService.showTutorialForPage(this.pageID);
  }

  ngAfterViewInit(): void {
    this.tutorialService.currentPage.next(PageNames.profile);
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

