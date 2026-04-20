import { Injectable } from '@angular/core';

interface CacheEntry<T> {
  value: T;
  expiresAt: number | null;
}

const DEFAULT_TTL_MS = 5 * 60 * 1000;

@Injectable({ providedIn: 'root' })
export class CacheService {
  private readonly store = new Map<string, CacheEntry<unknown>>();
  private readonly defaultTtlMs = DEFAULT_TTL_MS;

  get<T>(key: string): T | undefined {
    const entry = this.store.get(key);

    if (!entry) {
      return undefined;
    }

    if (this.isExpired(entry)) {
      this.store.delete(key);
      return undefined;
    }

    return entry.value as T;
  }

  set<T>(key: string, value: T, ttlMs: number = this.defaultTtlMs): void {
    this.store.set(key, {
      value,
      expiresAt: ttlMs > 0 ? Date.now() + ttlMs : null
    });
  }

  has(key: string): boolean {
    return this.get(key) !== undefined;
  }

  clear(key?: string): void {
    if (!key) {
      this.store.clear();
      return;
    }

    this.store.delete(key);
  }

  refresh(key: string): void {
    this.clear(key);
  }

  clearByPrefix(prefix: string): void {
    for (const key of this.store.keys()) {
      if (key.startsWith(prefix)) {
        this.store.delete(key);
      }
    }
  }

  private isExpired(entry: CacheEntry<unknown>): boolean {
    return entry.expiresAt !== null && entry.expiresAt <= Date.now();
  }
}
