import { Injectable, computed, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class LoadingService {
  private readonly activeRequestCount = signal(0);

  readonly isLoading = computed(() => this.activeRequestCount() > 0);

  start(): void {
    this.activeRequestCount.update((count) => count + 1);
  }

  stop(): void {
    this.activeRequestCount.update((count) => Math.max(0, count - 1));
  }

  reset(): void {
    this.activeRequestCount.set(0);
  }
}
