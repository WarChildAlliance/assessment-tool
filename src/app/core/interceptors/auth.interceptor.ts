import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { AuthService } from '../services/auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor(
    private authService: AuthService
  ) { }

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    if (request.url.match(environment.API_URL) && !request.url.match('token-auth')) {
      const token = this.authService.getToken();
      if (!token) {
        this.authService.logout();
      }

      const authentifiedRequest = request.clone({ setHeaders: { Authorization: `Token ${token}` }});
      return next.handle(authentifiedRequest);
    }
    return next.handle(request);
  }
}
