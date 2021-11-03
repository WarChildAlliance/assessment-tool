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
    public cancelBtnText = 'cancel';
    public confirmBtnText = 'OK';
    public confirmBtnColor: ThemePalette = 'primary';
    public imageURL = 'assets/icons/flying-bee.svg'; // if customized, add the path here relative to assets folder
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
            this.audioURL = 'assets/audios/' + data.audioURL;
        }

    }

    ngOnInit(): void {
    }

    /*
    playAudio(): void {
        console.log('audio', this.audio);
        if (this.isAudioPlaying) {
            const newAudio = new Audio(this.audioURL)
            this.audio.pause();
            newAudio.load();
            newAudio.play();
            this.audio = newAudio;
        } else {
            this.audio = new Audio(this.audioURL)
            this.audio.load();
            this.audio.play();
            this.isAudioPlaying = true;
        }
    }

    ngOnDestroy(): void {
        if (this.audio) {
            this.audio.pause()
        }
    }*/

    closeModal(): void {
    }
}
