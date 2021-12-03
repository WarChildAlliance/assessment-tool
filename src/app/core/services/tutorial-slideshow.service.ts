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

  async startTutorial(): Promise<boolean>{
    console.log('start tutorial', this.tutorial);
    return new Promise((resolve, reject) => {
      if (this.tutorial.completed) {
        this.tutorial.completed = false;
        this.resetTutorial();
        console.log('resolve');
        resolve(true);
      } else {
        console.log('tutorial was not completed');
      }
    });
  }

  showTutorialForPage(pageName: string): void {
    console.log('show tutorial for', pageName);
    if (!this.tutorial.completed) {
      const currentPage = this.tutorial.pages.find(page => (page.pageID === pageName && !page.completed));
      console.log(currentPage, this.tutorial);
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
    console.log('reseted tutorial');
    this.tutorial.pages.forEach(page => {
      page.completed = false;
    });
  }



}
