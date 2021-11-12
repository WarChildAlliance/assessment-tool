import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { ThemePalette } from '@angular/material/core';

interface DialogData {
  steps: any;
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
  public index = 0;
  public steps =  null;
  private audio: HTMLAudioElement;

  constructor(@Inject(MAT_DIALOG_DATA) public data: DialogData, public translate: TranslateService) {
    if (data.steps) {
      this.steps = data.steps;
    }
   }

  ngOnInit(): void {
    this.playAudio();
  }

  getImage(): string{
    return 'assets/tutorial/images/' + this.steps[this.index].pictureURL;
  }

  getAudio(): string{
    return 'assets/tutorial/audio/' + this.steps[this.index].audioURL;
  }

  playAudio(): void {
    this.audio = new Audio(this.getAudio());
    this.audio.play();
  }

  stopAudio(): void{
    this.audio.pause();
  }

  clickNext(): void {
    this.index += 1;
    this.stopAudio();
    this.playAudio();
  }

  clickPrevious(): void {
    if (this.index > 1) {
      this.index -= 1;
    } else {
      this.index = 0;
    }
    this.stopAudio();
    this.playAudio();
  }

  closeTutorial(): void {
    this.audio.pause();
  }

}
