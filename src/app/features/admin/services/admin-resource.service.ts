import { HttpClient, HttpParams } from '@angular/common/http';
import { inject } from '@angular/core';
import { Observable, asyncScheduler, observeOn, scheduled, tap } from 'rxjs';
import { environment } from '../../../../environments/assessment/environment';
import { CacheService } from '../../../shared/services/cache.service';
import {
  AdminItemResponse,
  AdminListResponse,
  AdminMessageResponse,
  AdminQueryParams,
  AdminResourceId
} from '../models/admin-api.model';

interface AdminCacheOptions {
  refresh?: boolean;
  ttlMs?: number;
}

const DEFAULT_ADMIN_CACHE_TTL_MS = 5 * 60 * 1000;

function buildHttpParams(params?: AdminQueryParams): HttpParams | undefined {
  if (!params) {
    return undefined;
  }

  let httpParams = new HttpParams();

  for (const [key, value] of Object.entries(params)) {
    if (value == null) {
      continue;
    }

    if (Array.isArray(value)) {
      for (const item of value) {
        httpParams = httpParams.append(key, String(item));
      }

      continue;
    }

    httpParams = httpParams.set(key, String(value));
  }

  return httpParams;
}

function serializeQueryParams(params?: AdminQueryParams): string {
  if (!params) {
    return '';
  }

  const normalizedEntries = Object.entries(params)
    .filter(([, value]) => value != null)
    .sort(([leftKey], [rightKey]) => leftKey.localeCompare(rightKey))
    .map(([key, value]) => [
      key,
      Array.isArray(value) ? value.map((item) => String(item)) : String(value)
    ]);

  return JSON.stringify(normalizedEntries);
}

export abstract class AdminEndpointService {
  protected readonly http = inject(HttpClient);
  protected readonly cache = inject(CacheService);
  private readonly adminUrl = `${environment.apiUrl}/admin`;

  protected constructor(private readonly endpoint: string) {}

  protected collectionUrl(): string {
    return `${this.adminUrl}/${this.endpoint}`;
  }

  protected itemUrl(id: AdminResourceId): string {
    return `${this.collectionUrl()}/${id}`;
  }

  protected requestOptions(params?: AdminQueryParams): { params?: HttpParams } {
    const httpParams = buildHttpParams(params);

    return httpParams ? { params: httpParams } : {};
  }

  clearCache(): void {
    this.cache.clearByPrefix(this.cacheNamespacePrefix());
  }

  protected getCachedValue<T>(segment: string): T | null {
    return this.cache.get<T>(this.cacheKey(segment)) ?? null;
  }

  protected setCachedValue<T>(
    segment: string,
    value: T,
    ttlMs: number = DEFAULT_ADMIN_CACHE_TTL_MS
  ): void {
    this.cache.set(this.cacheKey(segment), value, ttlMs);
  }

  protected clearCachedValue(segment: string): void {
    this.cache.clear(this.cacheKey(segment));
  }

  protected cacheKey(segment: string): string {
    return `${this.cacheNamespacePrefix()}${segment}`;
  }

  private cacheNamespacePrefix(): string {
    return `admin:${this.endpoint}:`;
  }
}

export abstract class AdminReadService<TEntity> extends AdminEndpointService {
  protected constructor(endpoint: string) {
    super(endpoint);
  }

  list(
    params?: AdminQueryParams,
    options?: AdminCacheOptions
  ): Observable<AdminListResponse<TEntity>> {
    const cacheSegment = this.listCacheSegment(params);

    if (!options?.refresh) {
      const cached = this.getCachedValue<AdminListResponse<TEntity>>(cacheSegment);
      if (cached !== null) {
        return scheduled([cached], asyncScheduler);
      }
    } else {
      this.clearCachedValue(cacheSegment);
    }

    return this.http.get<AdminListResponse<TEntity>>(
      this.collectionUrl(),
      this.requestOptions(params)
    ).pipe(
      tap((response) => this.setCachedValue(cacheSegment, response, options?.ttlMs)),
      observeOn(asyncScheduler)
    );
  }

  get(
    id: AdminResourceId,
    params?: AdminQueryParams,
    options?: AdminCacheOptions
  ): Observable<AdminItemResponse<TEntity>> {
    const cacheSegment = this.itemCacheSegment(id, params);

    if (!options?.refresh) {
      const cached = this.getCachedValue<AdminItemResponse<TEntity>>(cacheSegment);
      if (cached !== null) {
        return scheduled([cached], asyncScheduler);
      }
    } else {
      this.clearCachedValue(cacheSegment);
    }

    return this.http.get<AdminItemResponse<TEntity>>(
      this.itemUrl(id),
      this.requestOptions(params)
    ).pipe(
      tap((response) => this.setCachedValue(cacheSegment, response, options?.ttlMs)),
      observeOn(asyncScheduler)
    );
  }

  refreshList(
    params?: AdminQueryParams,
    options?: Omit<AdminCacheOptions, 'refresh'>
  ): Observable<AdminListResponse<TEntity>> {
    return this.list(params, { ...options, refresh: true });
  }

  refreshItem(
    id: AdminResourceId,
    params?: AdminQueryParams,
    options?: Omit<AdminCacheOptions, 'refresh'>
  ): Observable<AdminItemResponse<TEntity>> {
    return this.get(id, params, { ...options, refresh: true });
  }

  protected listCacheSegment(params?: AdminQueryParams): string {
    const serializedParams = serializeQueryParams(params);
    return serializedParams ? `list:${serializedParams}` : 'list';
  }

  protected itemCacheSegment(
    id: AdminResourceId,
    params?: AdminQueryParams
  ): string {
    const serializedParams = serializeQueryParams(params);
    return serializedParams
      ? `item:${id}:${serializedParams}`
      : `item:${id}`;
  }
}

export abstract class AdminCrudService<
  TEntity,
  TCreatePayload,
  TUpdatePayload = Partial<TCreatePayload>
> extends AdminReadService<TEntity> {
  protected constructor(endpoint: string) {
    super(endpoint);
  }

  create(payload: TCreatePayload): Observable<AdminItemResponse<TEntity>> {
    return this.http.post<AdminItemResponse<TEntity>>(this.collectionUrl(), payload).pipe(
      tap(() => this.clearCache())
    );
  }

  update(
    id: AdminResourceId,
    payload: TUpdatePayload
  ): Observable<AdminItemResponse<TEntity>> {
    return this.http.put<AdminItemResponse<TEntity>>(this.itemUrl(id), payload).pipe(
      tap(() => this.clearCache())
    );
  }

  delete(id: AdminResourceId): Observable<AdminMessageResponse> {
    return this.http.delete<AdminMessageResponse>(this.itemUrl(id)).pipe(
      tap(() => this.clearCache())
    );
  }
}
