import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, tap } from 'rxjs';
import { environment } from '../../../environments/assessment/environment';
import { CacheService } from './cache.service';

export interface Subject {
  id?: number;
  program_id: number;
  subject_name: string;
  subject_code: string;
  credits?: number;
  created_at?: string;
  updated_at?: string;
}

@Injectable({
  providedIn: 'root'
})
export class SubjectsService {
  private readonly apiUrl = environment.apiUrl;
  private readonly cachePrefix = 'admin:subjects:';

  constructor(
    private http: HttpClient,
    private cache: CacheService
  ) {}

list(params: {page?: number, per_page?: number} = {}): Observable<any> {
    const paramsStr = new URLSearchParams(params as any).toString();
    const url = `${this.apiUrl}/admin/subjects${paramsStr ? `?${paramsStr}` : ''}`;
    const cacheKey = `${this.cachePrefix}list${paramsStr ? `_${paramsStr}` : ''}`;
    const cached = this.cache.get<any>(cacheKey);

    if (cached) {
      return of(cached);
    }

    return this.http.get<any>(url).pipe(
      tap((response) => this.cache.set(cacheKey, response))
    );
  }

  get(id: number): Observable<Subject> {
    const cacheKey = `${this.cachePrefix}item:${id}`;
    const cached = this.cache.get<Subject>(cacheKey);

    if (cached) {
      return of(cached);
    }

    return this.http.get<Subject>(`${this.apiUrl}/admin/subjects/${id}`).pipe(
      tap((subject) => this.cache.set(cacheKey, subject))
    );
  }

  create(data: Subject): Observable<Subject> {
    return this.http.post<Subject>(`${this.apiUrl}/admin/subjects`, data).pipe(
      tap(() => this.clearCache())
    );
  }

  update(id: number, data: Subject): Observable<Subject> {
    return this.http.put<Subject>(`${this.apiUrl}/admin/subjects/${id}`, data).pipe(
      tap(() => this.clearCache())
    );
  }

  delete(id: number): Observable<{ message: string }> {
    return this.http
      .delete<{ message: string }>(`${this.apiUrl}/admin/subjects/${id}`)
      .pipe(tap(() => this.clearCache()));
  }

  private clearCache(): void {
    this.cache.clearByPrefix(this.cachePrefix);
  }
}
