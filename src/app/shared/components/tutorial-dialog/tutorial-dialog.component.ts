import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ThemePalette } from '@angular/material/core';

interface DialogData {
  title: string;
  content?: string;
  imageURL: string;
  audioURL: string;
}

@Component({
  selector: 'app-tutorial-dialog',
  templateUrl: './tutorial-dialog.component.html',
  styleUrls: ['./tutorial-dialog.component.scss']
})

export class TutorialDialogComponent implements OnInit {


  public title ? = '';
  public content ? = '';
  public imageURL = '';
  public audioURL = '';

  constructor(@Inject(MAT_DIALOG_DATA) public data: DialogData) {
    if (data.title) {
      this.title = data.title;
    }
    if (data.content) {
        this.content = data.content;
    }
    if (data.imageURL) {
        this.imageURL = 'assets/tutorial/images/' + data.imageURL;
    }
    if (data.audioURL) {
        this.audioURL = 'assets/audios/audio/' + data.audioURL;
    }
   }

  ngOnInit(): void {
  }

}
