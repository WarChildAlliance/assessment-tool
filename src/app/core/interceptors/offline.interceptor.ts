import {
  HttpEvent, HttpHandler,

  HttpInterceptor, HttpRequest
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { EMPTY, Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { CacheService } from '../services/cache.service';

@Injectable()
export class OfflineInterceptor implements HttpInterceptor {

  constructor(
    private cacheService: CacheService
  ) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    if (request.url.match(environment.API_URL) && request.method !== 'GET') {

          const online = this.cacheService.networkStatus.getValue();
          if (online) {
            return next.handle(request);
          } else {
            this.cacheService.setRequest(request);
            return EMPTY;
          }
    }
    return next.handle(request);
  }
}
