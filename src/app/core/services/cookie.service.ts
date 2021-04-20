import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CookieService {
  private documentAccessible = false;

  constructor(
    @Inject(DOCUMENT) private document: Document,
    @Inject(PLATFORM_ID) private platformId: any
  ) {
    this.documentAccessible = isPlatformBrowser(this.platformId);
  }

  has(name: string): boolean {
    if (!this.documentAccessible) {
      return false;
    }

    name = encodeURIComponent(name);
    const regExp = this.getCookieRegExp(name);
    const hasCookie = regExp.test(this.document.cookie);
    return hasCookie;
  }

  get(name: string): string {
    if (!this.documentAccessible || !this.has(name)) {
      return null;
    }

    name = encodeURIComponent(name);
    const regExp = this.getCookieRegExp(name);
    const res = regExp.exec(this.document.cookie);
    return decodeURIComponent(res[1]);

  }

  set(name: string, value: string, expiresIn: number = 7): void {
    if (!this.documentAccessible) {
      return;
    }

    let cookieString = encodeURIComponent(name) + '=' + encodeURIComponent(value) + ';';

    // Set cookie expiry to 7 days
    const dateExpires = new Date(new Date().getTime() + expiresIn * 1000 * 60 * 60 * 24);
    cookieString += `expires=${dateExpires.toUTCString()};`;

    // Set secure option in production environment
    if (environment.production) {
      cookieString += 'secure;';
    }

    // Set same site option, for cross-site requests
    cookieString += 'sameSite=Lax;';

    this.document.cookie = cookieString;
  }

  delete(name: string): void {
    if (!this.documentAccessible) {
      return;
    }

    this.set(name, '', -7);
  }

  private getCookieRegExp(name): RegExp {
    const escapedName = name.replace(/([\[\]\{\}\(\)\|\=\;\+\?\,\.\*\^\$])/gi, '\\$1');
    return new RegExp(`(?:(?:^|;\\s*)${escapedName}=)([^;]*)(?:;|$)`, 'g');
  }
}
