import { Injectable } from '@angular/core';
import { AssisstantContent } from 'src/app/constants/assisstant-content.dictionary';
import { AssisstantContentModel } from '../models/assisstant-content.model';

@Injectable({
  providedIn: 'root'
})
export class AssisstantService {


  private pageID: string;
  private pageContent: AssisstantContentModel;
  private assisstantContent = AssisstantContent;

  constructor() { }

  public setPageID(currentPageID: string): void {
    this.pageID = currentPageID;
    this.pageContent = this.assisstantContent.filter(item => item.pageID === this.pageID).pop();
  }

  public getPageID(): string {
    return this.pageID;
  }

  public getPageContent(): AssisstantContentModel {
    return this.pageContent;
  }
}
