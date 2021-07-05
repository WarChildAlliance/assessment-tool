import { Injectable } from '@angular/core';
import { BeeContent } from 'src/app/constants/bee-content.dictionary';
import { AssisstantContent } from '../models/assisstent-content.model';

@Injectable({
  providedIn: 'root'
})
export class AssisstantService {

  constructor() { }

  pageID: string;
  pageContent: AssisstantContent;
  beeContent = BeeContent;

  setPageID(currentPageID: string): void {
    this.pageID = currentPageID;
    this.pageContent = this.beeContent.filter(item => item.pageID === this.pageID).pop();
  }

  getPageContent(): AssisstantContent {
    return this.pageContent;
  }

}
