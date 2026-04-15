import { Injectable } from '@angular/core';
import {
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest
} from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  intercept(
    request: HttpRequest<unknown>,
    next: HttpHandler
  ): Observable<HttpEvent<unknown>> {
    const token = localStorage.getItem('token');

    if (!token) {
      return next.handle(request);
    }

    const authorizedRequest = request.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json'
      }
    });

    return next.handle(authorizedRequest);
  }
}
