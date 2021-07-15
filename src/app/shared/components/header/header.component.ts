import { Component, Input, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { User } from 'src/app/core/models/user.model';
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
    public dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.route.data.subscribe(
      (data: { user: User }) => this.user = data.user
    );
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
