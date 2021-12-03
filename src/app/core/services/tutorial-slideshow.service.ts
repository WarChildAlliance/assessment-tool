import { Injectable } from '@angular/core';
import { TutorialContent } from '../../constants/tutorial.dictionary';
import { MatDialog } from '@angular/material/dialog';
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
      this.resetTutorial();
      this.showTutorialForPage('assessments-page');
    }
  }

  showTutorialForPage(pageName: string): void {
    if (!this.tutorial.completed) {
      const currentPage = this.tutorial.pages.find(page => (page.pageID === pageName && !page.completed));
      if (currentPage) {
        this.tutorial.pages.find(page => page.pageID === pageName && !page.completed).completed = true;
        const dialogRef = this.dialog.open(TutorialDialogComponent, {
          disableClose: true,
          data: {
            steps: currentPage.steps
          }
        });
      }
      if (currentPage?.final) {
        this.resetTutorial();
        this.tutorial.completed = true;
      }
    }
  }

  resetTutorial(): void {
    this.tutorial.pages.forEach(page => {
      page.completed = false;
    });
  }



}
