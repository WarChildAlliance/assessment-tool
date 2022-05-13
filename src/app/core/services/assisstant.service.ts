import { Injectable } from '@angular/core';
import { AssisstantContent } from 'src/app/constants/assisstant-content.dictionary';
import { AssisstantContentModel } from '../models/assisstant-content.model';

@Injectable({
  providedIn: 'root'
})
export class AssisstantService {

  constructor() { }

  pageID: string;
  pageContent: AssisstantContentModel;
  assisstantContent = AssisstantContent;

  setPageID(currentPageID: string): void {
    this.pageID = currentPageID;
    this.pageContent = this.assisstantContent.filter(item => item.pageID === this.pageID).pop();
  }

  getPageID(): string {
    return this.pageID;
  }
  getPageContent(): AssisstantContentModel {
    return this.pageContent;
  }
}
