import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, tap } from 'rxjs';
import { environment } from '../../../environments/assessment/environment';
import { CacheService } from './cache.service';

export interface Student {
  id?: number;
  user_id: number;
  student_id_number: string;
  program_id: number;
  date_of_birth?: string;
  phone_number?: string;
  created_at?: string;
  updated_at?: string;
}

@Injectable({
  providedIn: 'root'
})
export class StudentsService {
  private readonly apiUrl = environment.apiUrl;
  private readonly cachePrefix = 'admin:students:';

  constructor(
    private http: HttpClient,
    private cache: CacheService
  ) {}

  list(): Observable<Student[]> {
    const cacheKey = `${this.cachePrefix}list`;
    const cached = this.cache.get<Student[]>(cacheKey);

    if (cached) {
      return of(cached);
    }

    return this.http.get<Student[]>(`${this.apiUrl}/admin/students`).pipe(
      tap((students) => this.cache.set(cacheKey, students))
    );
  }

  get(id: number): Observable<Student> {
    const cacheKey = `${this.cachePrefix}item:${id}`;
    const cached = this.cache.get<Student>(cacheKey);

    if (cached) {
      return of(cached);
    }

    return this.http.get<Student>(`${this.apiUrl}/admin/students/${id}`).pipe(
      tap((student) => this.cache.set(cacheKey, student))
    );
  }

  create(data: Student): Observable<Student> {
    return this.http.post<Student>(`${this.apiUrl}/admin/students`, data).pipe(
      tap(() => this.clearCache())
    );
  }

  update(id: number, data: Student): Observable<Student> {
    return this.http.put<Student>(`${this.apiUrl}/admin/students/${id}`, data).pipe(
      tap(() => this.clearCache())
    );
  }

  delete(id: number): Observable<{ message: string }> {
    return this.http
      .delete<{ message: string }>(`${this.apiUrl}/admin/students/${id}`)
      .pipe(tap(() => this.clearCache()));
  }

  private clearCache(): void {
    this.cache.clearByPrefix(this.cachePrefix);
  }
}
