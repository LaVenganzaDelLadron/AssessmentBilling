import { HttpClient, HttpParams } from '@angular/common/http';
import { inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/assessment/environment';
import {
  AdminItemResponse,
  AdminListResponse,
  AdminMessageResponse,
  AdminQueryParams,
  AdminResourceId
} from '../models/admin-api.model';

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

export abstract class AdminEndpointService {
  protected readonly http = inject(HttpClient);
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
}

export abstract class AdminReadService<TEntity> extends AdminEndpointService {
  protected constructor(endpoint: string) {
    super(endpoint);
  }

  list(params?: AdminQueryParams): Observable<AdminListResponse<TEntity>> {
    return this.http.get<AdminListResponse<TEntity>>(
      this.collectionUrl(),
      this.requestOptions(params)
    );
  }

  get(
    id: AdminResourceId,
    params?: AdminQueryParams
  ): Observable<AdminItemResponse<TEntity>> {
    return this.http.get<AdminItemResponse<TEntity>>(
      this.itemUrl(id),
      this.requestOptions(params)
    );
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
    return this.http.post<AdminItemResponse<TEntity>>(this.collectionUrl(), payload);
  }

  update(
    id: AdminResourceId,
    payload: TUpdatePayload
  ): Observable<AdminItemResponse<TEntity>> {
    return this.http.put<AdminItemResponse<TEntity>>(this.itemUrl(id), payload);
  }

  delete(id: AdminResourceId): Observable<AdminMessageResponse> {
    return this.http.delete<AdminMessageResponse>(this.itemUrl(id));
  }
}
