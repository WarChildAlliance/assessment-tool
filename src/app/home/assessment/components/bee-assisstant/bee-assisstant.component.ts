import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { GenericConfirmationDialogComponent } from '../../../../shared/components/generic-confirmation-dialog/generic-confirmation-dialog.component';

@Component({
  selector: 'app-bee-assisstant',
  templateUrl: './bee-assisstant.component.html',
  styleUrls: ['./bee-assisstant.component.scss']
})
export class BeeAssisstantComponent implements OnInit {

  constructor(public dialog: MatDialog) {

  }

  ngOnInit(): void {
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
