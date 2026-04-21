import { ApplicationRef, Injectable } from '@angular/core';
import {
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest
} from '@angular/common/http';
import { Observable, finalize } from 'rxjs';
import { LoadingService } from '../../shared/services/loading.service';

@Injectable()
export class AdminLoadingInterceptor implements HttpInterceptor {
  constructor(
    private loadingService: LoadingService,
    private appRef: ApplicationRef
  ) {}

  intercept(
    request: HttpRequest<unknown>,
    next: HttpHandler
  ): Observable<HttpEvent<unknown>> {
    if (!this.shouldTrack(request)) {
      return next.handle(request);
    }

    this.loadingService.start();

    return next.handle(request).pipe(
      finalize(() => {
        this.loadingService.stop();
        queueMicrotask(() => {
          this.appRef.tick();
        });
      })
    );
  }

  private shouldTrack(request: HttpRequest<unknown>): boolean {
    const normalizedUrl = request.url.toLowerCase();

    return (
      normalizedUrl.includes('/api/admin') ||
      normalizedUrl.includes('/admin/')
    );
  }
}
