import { Injectable } from '@angular/core';
import { TutorialContent } from '../../constants/tutorial.dictionary';

@Injectable({
  providedIn: 'root'
})
export class TutorialSlideshowService {

  public tutorial: any = TutorialContent;

  constructor() { }

  startTutorial(): void{
    if (this.tutorial.completed) {
      this.tutorial.completed = false;
      this.tutorial.pages.forEach(page => {
        page.completed = false;
      });
    }
  }

  showTutorialForPage(pageName: string): void{
    const currentPage = this.tutorial.pages.find(page => (page.pageID === pageName && !page.completed));
    if (currentPage) {
      this.tutorial.pages.find(page => page.pageID === pageName && !page.completed).completed = true;
      currentPage.steps.forEach(step => console.log(step.text));
    }
  }
}
