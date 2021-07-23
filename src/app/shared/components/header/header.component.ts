import { Component, Input, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { User } from 'src/app/core/models/user.model';
import { CacheService } from 'src/app/core/services/cache.service';
import { UserService } from 'src/app/core/services/user.service';
import { environment } from 'src/environments/environment';
import { GenericConfirmationDialogComponent } from '../generic-confirmation-dialog/generic-confirmation-dialog.component';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
  user: User;

  @Input() style: 'smallsize' | 'fullsize' = 'smallsize';

  constructor(
    private route: ActivatedRoute,
    public dialog: MatDialog,
    private userService: UserService,
    public cacheService: CacheService,
  ) { }

  ngOnInit(): void {
    this.route.data.subscribe(
      (data: { user: User }) => this.user = data.user
    );

    this.userService.currentUser.subscribe( res => {
      if (this.cacheService.networkStatus.getValue()) {
        this.user = res;
      } else {
        this.cacheService.getData('active-user').then( user => {
          this.user = user;
        });
      }
    });
  }

  getImageUrl(): string {

    // TODO We should replace by a real default image so the students can understand it's not the expected one
    const imageUrl = this.user.profile.current_avatar?.image ?
      (environment.API_URL + this.user.profile.current_avatar.image) :
      'assets/icons/Bee.svg';

    return imageUrl;
  }

  openDialog(): void {
    const dialogRef = this.dialog.open(GenericConfirmationDialogComponent, {
      disableClose: true,
      data: {
          title: 'hi',
          content: 'info',
          confirmBtnText: 'OK',
          confirmBtnColor: 'primary',
      }
  });
  }
}
