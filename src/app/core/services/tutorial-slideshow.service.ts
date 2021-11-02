import { Injectable } from '@angular/core';
import { TutorialContent } from '../../constants/tutorial.dictionary';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import { TutorialDialogComponent } from '../../shared/components/tutorial-dialog/tutorial-dialog.component';

@Injectable({
  providedIn: 'root'
})
export class TutorialSlideshowService {

  public tutorial: any = TutorialContent;

  constructor(
    public dialog: MatDialog,
  ) { }

  startTutorial(): void{
    if (this.tutorial.completed) {
      this.tutorial.completed = false;
      this.tutorial.pages.forEach(page => {
        page.completed = false;
      });
    }
  }

  showTutorialForPage(pageName: string): void {
    console.log(this.tutorial.pages.find(page => page.pageID = pageName))
    const currentPage = this.tutorial.pages.find(page => (page.pageID === pageName && !page.completed));
    console.log(this.tutorial)
    if (currentPage) {
      this.tutorial.pages.find(page => page.pageID === pageName && !page.completed).completed = true;
      const dialogRef = this.dialog.open(TutorialDialogComponent, {
        disableClose: true,
        data: {
          steps: currentPage.steps
        }
      });
      dialogRef.afterClosed().subscribe(closed =>
        {
        // need to set page as completed?
        });

    }
  }


}
