import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ThemePalette } from '@angular/material/core';

interface DialogData {
    title: string;
    content?: string;
    contentAsInnerHTML?: boolean;
    cancelBtnText?: string;
    confirmBtnText?: string;
    confirmBtnColor?: 'warn' | 'primary' | 'accent';
}

@Component({
    selector: 'app-generic-confirmation-dialog',
    templateUrl: './generic-confirmation-dialog.component.html',
    styleUrls: ['./generic-confirmation-dialog.component.scss']
})
export class GenericConfirmationDialogComponent implements OnInit {

    public title = '';
    public content = '';
    public contentAsInnerHTML = false;
    public cancelBtnText = 'Cancel';
    public confirmBtnText = 'Confirm';
    public confirmBtnColor: ThemePalette = 'primary';

    constructor(@Inject(MAT_DIALOG_DATA) public data: DialogData) {
        if (data.title) {
            this.title = data.title;
        }
        if (data.content) {
            this.content = data.content;
        }
        if (data.cancelBtnText) {
            this.cancelBtnText = data.cancelBtnText;
        }
        if (data.confirmBtnText) {
            this.confirmBtnText = data.confirmBtnText;
        }
        if (data.confirmBtnColor) {
            this.confirmBtnColor = data.confirmBtnColor;
        }
        if (data.contentAsInnerHTML) {
            this.contentAsInnerHTML = data.contentAsInnerHTML;
        }
    }

    ngOnInit(): void {
    }

}
