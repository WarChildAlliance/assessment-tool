import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { User } from 'src/app/core/models/user.model';
import { MatDialog } from '@angular/material/dialog';
import { GenericConfirmationDialogComponent } from '../../../../shared/components/generic-confirmation-dialog/generic-confirmation-dialog.component';



@Component({
  selector: 'app-assessment-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
  user: User;

  constructor(
    private route: ActivatedRoute,
    public dialog: MatDialog,
  ) { }

  ngOnInit(): void {
    this.route.data.subscribe(
      (data: { user: User }) => this.user = data.user
    );
  }


  openDialog(): void {
    const dialogRef = this.dialog.open(GenericConfirmationDialogComponent, {
      disableClose: true,
      data: {
          title: 'Hi!',
          content: '<p>Info here is coming up</p>',
          contentAsInnerHTML: true,
          confirmBtnText: 'OK',
          confirmBtnColor: 'primary',
      }
  });
  }
}
