import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
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

  constructor(@Inject(MAT_DIALOG_DATA) public data: DialogData) {
    if (data.steps) {
      this.steps = data.steps;
    }
   }

  ngOnInit(): void {
  }

  getImage(): string{
    return 'assets/tutorial/images/' + this.steps[this.index].pictureURL;
  }

  getAudio(): string{
    return 'assets/tutorial/audio/' + this.steps[this.index].audioURL;
  }

  clickNext(): void {
    this.index += 1;
  }

  clickPrevious(): void {
    if (this.index > 1) {
      this.index -= 1;
    } else {
      this.index = 0;
    }
  }

}
