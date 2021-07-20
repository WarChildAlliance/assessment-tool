import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ThemePalette } from '@angular/material/core';

interface DialogData {
    title: string;
    content?: string;
    contentType?: 'text' | 'innerHTML' | 'translation';
    cancelBtn?: boolean;
    cancelBtnText?: string;
    confirmBtnText?: string;
    confirmBtnColor?: 'warn' | 'primary' | 'accent';
    imageURL: string;
    audioURL?: string;
}

@Component({
    selector: 'app-generic-confirmation-dialog',
    templateUrl: './generic-confirmation-dialog.component.html',
    styleUrls: ['./generic-confirmation-dialog.component.scss']
})
export class GenericConfirmationDialogComponent implements OnInit {

    // TODO add small explanation on usage here

    public title = '';
    public content = '';
    public contentType = 'translation';
    public cancelBtn = false;
    public cancelBtnText = 'Cancel';
    public confirmBtnText = 'Confirm';
    public confirmBtnColor: ThemePalette = 'primary';
    public imageURL = '../../../../assets/bee-wabe.png'; // if customized, add the path here relative to assets folder
    public audioURL = '';  // if customized, add the path here relative to assets folder

    constructor(@Inject(MAT_DIALOG_DATA) public data: DialogData) {
        if (data.title) {
            this.title = data.title;
        }
        if (data.content) {
            this.content = data.content;
        }
        if (data.contentType) {
            this.contentType = data.contentType;
        }
        if (data.cancelBtn) {
            this.cancelBtn = data.cancelBtn;
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
        if (data.imageURL) {
            this.imageURL = '../../../../assets/' + data.imageURL;
        }
        if (data.audioURL) {
            this.audioURL = '../../../../assets/' + data.audioURL ;
        }

    }

    ngOnInit(): void {
    }

}
