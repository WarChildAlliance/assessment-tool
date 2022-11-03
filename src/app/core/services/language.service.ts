import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Language } from '../models/language.model';

@Injectable({
  providedIn: 'root'
})
export class LanguageService {
  private direction = new BehaviorSubject<'RTL' | 'LTR'>(null);

  constructor(
    private http: HttpClient,
    private translateService: TranslateService
  ) {
    this.translateService.setDefaultLang('eng');
  }

  public getLanguages(): Observable<Language[]> {
    return this.http.get<Language[]>(`${environment.API_URL}/users/languages/`);
  }

  public setLanguage(language: Language): void {
    this.translateService.use(language.code.toLowerCase());
    this.setDirection(language.direction);
  }

  private setDirection(direction: 'RTL' | 'LTR'): void {
    document.getElementsByTagName('html')[0].setAttribute('dir', direction.toLowerCase());
    document.getElementsByTagName('html')[0].classList.add(direction.toLowerCase());
    if (direction === 'RTL') {
      document.getElementsByTagName('html')[0].classList.add('arabic');
    }
    this.direction.next(direction);
  }
}
