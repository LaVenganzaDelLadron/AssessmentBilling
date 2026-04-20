import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, tap } from 'rxjs';
import { environment } from '../../../environments/assessment/environment';
import { CacheService } from './cache.service';

export interface Teacher {
  id?: number;
  user_id: number;
  employee_id: string;
  department?: string;
  phone_number?: string;
  created_at?: string;
  updated_at?: string;
}

@Injectable({
  providedIn: 'root'
})
export class TeachersService {
  private readonly apiUrl = environment.apiUrl;
  private readonly cachePrefix = 'admin:teachers:';

  constructor(
    private http: HttpClient,
    private cache: CacheService
  ) {}

  list(): Observable<Teacher[]> {
    const cacheKey = `${this.cachePrefix}list`;
    const cached = this.cache.get<Teacher[]>(cacheKey);

    if (cached) {
      return of(cached);
    }

    return this.http.get<Teacher[]>(`${this.apiUrl}/admin/teachers`).pipe(
      tap((teachers) => this.cache.set(cacheKey, teachers))
    );
  }

  get(id: number): Observable<Teacher> {
    const cacheKey = `${this.cachePrefix}item:${id}`;
    const cached = this.cache.get<Teacher>(cacheKey);

    if (cached) {
      return of(cached);
    }

    return this.http.get<Teacher>(`${this.apiUrl}/admin/teachers/${id}`).pipe(
      tap((teacher) => this.cache.set(cacheKey, teacher))
    );
  }

  create(data: Teacher): Observable<Teacher> {
    return this.http.post<Teacher>(`${this.apiUrl}/admin/teachers`, data).pipe(
      tap(() => this.clearCache())
    );
  }

  update(id: number, data: Teacher): Observable<Teacher> {
    return this.http.put<Teacher>(`${this.apiUrl}/admin/teachers/${id}`, data).pipe(
      tap(() => this.clearCache())
    );
  }

  delete(id: number): Observable<{ message: string }> {
    return this.http
      .delete<{ message: string }>(`${this.apiUrl}/admin/teachers/${id}`)
      .pipe(tap(() => this.clearCache()));
  }

  private clearCache(): void {
    this.cache.clearByPrefix(this.cachePrefix);
  }
}
