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
    animation: { src: string; frameCount: number; loop: boolean };
    audioURL?: string;
    openDialogAudioURL?: string;
    confirmAudioURL?: string;
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
    public cancelBtnText = 'general.cancel';
    public confirmBtnText = 'general.OK';
    public confirmBtnColor: ThemePalette = 'primary';
    public imageURL = 'assets/icons/flying-bee.svg'; // if customized, add the path here relative to assets folder
    public animation: { src: string; frameCount: number; loop: boolean } = null;
    public audioURL = '';  // if customized, add the path here relative to assets folder
    public confirmAudioURL = '';

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
        if (data.animation) {
            this.animation = data.animation;
        }
        if (data.audioURL) {
            this.audioURL = 'assets/audios/' + data.audioURL;
        }
        if (data.openDialogAudioURL) {
            const audio = new Audio(data.openDialogAudioURL);
            audio.load();
            audio.play();
        }
        if (data.confirmAudioURL) {
            this.confirmAudioURL = data.confirmAudioURL;
        }
    }

    ngOnInit(): void {
    }

    public playConfirmAudio(): void {
        const audio = new Audio(this.confirmAudioURL);
        audio.load();
        audio.play();
    }
}
