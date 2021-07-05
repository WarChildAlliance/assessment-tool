import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { GenericConfirmationDialogComponent } from '../../../../shared/components/generic-confirmation-dialog/generic-confirmation-dialog.component';
import { AssisstantService } from 'src/app/core/services/assisstant.service';

@Component({
  selector: 'app-bee-assisstant',
  templateUrl: './bee-assisstant.component.html',
  styleUrls: ['./bee-assisstant.component.scss']
})
export class BeeAssisstantComponent implements OnInit {

beeContent: string;
currentPageContent: any = {};

  constructor(
    public dialog: MatDialog,
    private assisstantService: AssisstantService,
    ) { }

  ngOnInit(): void {
  }

  openDialog(): void {

    this.currentPageContent = this.assisstantService.getPageContent();

    const dialogRef = this.dialog.open(GenericConfirmationDialogComponent, {
      disableClose: true,
      data: {
          title: 'Hi!',
          content: this.currentPageContent.content,
          contentAsInnerHTML: true,
          confirmBtnText: 'OK',
          confirmBtnColor: 'primary',
      }
  });
  }
}
