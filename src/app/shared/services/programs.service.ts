import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, tap } from 'rxjs';
import { environment } from '../../../environments/assessment/environment';
import { CacheService } from './cache.service';

export interface Program {
  id?: number;
  program_name: string;
  program_code: string;
  description?: string;
  created_at?: string;
  updated_at?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ProgramsService {
  private readonly apiUrl = environment.apiUrl;
  private readonly cachePrefix = 'admin:programs:';

  constructor(
    private http: HttpClient,
    private cache: CacheService
  ) {}

  list(): Observable<Program[]> {
    const cacheKey = `${this.cachePrefix}list`;
    const cached = this.cache.get<Program[]>(cacheKey);

    if (cached) {
      return of(cached);
    }

    return this.http.get<Program[]>(`${this.apiUrl}/admin/programs`).pipe(
      tap((programs) => this.cache.set(cacheKey, programs))
    );
  }

  get(id: number): Observable<Program> {
    const cacheKey = `${this.cachePrefix}item:${id}`;
    const cached = this.cache.get<Program>(cacheKey);

    if (cached) {
      return of(cached);
    }

    return this.http.get<Program>(`${this.apiUrl}/admin/programs/${id}`).pipe(
      tap((program) => this.cache.set(cacheKey, program))
    );
  }

  create(data: Program): Observable<Program> {
    return this.http.post<Program>(`${this.apiUrl}/admin/programs`, data).pipe(
      tap(() => this.clearCache())
    );
  }

  update(id: number, data: Program): Observable<Program> {
    return this.http.put<Program>(`${this.apiUrl}/admin/programs/${id}`, data).pipe(
      tap(() => this.clearCache())
    );
  }

  delete(id: number): Observable<{ message: string }> {
    return this.http
      .delete<{ message: string }>(`${this.apiUrl}/admin/programs/${id}`)
      .pipe(tap(() => this.clearCache()));
  }

  private clearCache(): void {
    this.cache.clearByPrefix(this.cachePrefix);
  }
}
