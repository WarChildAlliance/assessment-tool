import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { GenericConfirmationDialogComponent } from '../generic-confirmation-dialog/generic-confirmation-dialog.component';
import { AssisstantService } from 'src/app/core/services/assisstant.service';

@Component({
    selector: 'app-assisstant',
    templateUrl: './assisstant.component.html',
    styleUrls: ['./assisstant.component.scss']
})
export class AssisstantComponent implements OnInit {

    currentPageContent: any = {};

    constructor(
        public dialog: MatDialog,
        private assisstantService: AssisstantService,
    ) {
    }

    ngOnInit(): void {
    }

    openDialog(): void {
        this.currentPageContent = this.assisstantService.getPageContent();

        this.dialog.open(GenericConfirmationDialogComponent, {
            disableClose: true,
            data: {
                title: 'general.hi',
                content: this.currentPageContent.content,
                contentType: 'translation',
                audioURL: this.currentPageContent.audioURL,
                confirmBtnText: 'general.OK',
                confirmBtnColor: 'primary',
            }
        });
        }
}
