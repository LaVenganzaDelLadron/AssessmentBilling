import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, forkJoin, map, throwError, timeout } from 'rxjs';
import { environment } from '../../environments/assessment/environment';
import { CollectionResponse, Role, Teacher, UserRole } from '../models/teacher.model';

@Injectable({
  providedIn: 'root'
})
export class TeacherService {
  private readonly apiUrl = environment.apiUrl;

  constructor(private readonly http: HttpClient) {}

  getTeachers(): Observable<Teacher[]> {
    return forkJoin({
      userRoles: this.http.get<CollectionResponse<UserRole> | UserRole[]>(`${this.apiUrl}/user-role`),
      roles: this.http.get<CollectionResponse<Role> | Role[]>(`${this.apiUrl}/role`)
    }).pipe(
      timeout(15000),
      map(({ userRoles, roles }) => {
        const roleList = this.unwrapArray(roles);
        const userRoleList = this.unwrapArray(userRoles);

        const teacherRoleIds = new Set(
          roleList
            .filter((role) => (role.name || '').toLowerCase() === 'teacher')
            .map((role) => role.id)
        );

        const teacherRows = userRoleList.filter((ur) => {
          const roleName = (ur.role?.name || '').toLowerCase();
          return roleName === 'teacher' || teacherRoleIds.has(ur.role_id);
        });

        const teachersById = new Map<string, Teacher>();

        for (const row of teacherRows) {
          const id = row.user?.id || row.user_id;
          if (!id || teachersById.has(id)) {
            continue;
          }

          const rawRow = row as UserRole & {
            name?: string;
            email?: string;
            user_name?: string;
            user_email?: string;
          };

          const name =
            row.user?.name ||
            rawRow.name ||
            rawRow.user_name ||
            id;

          const email =
            row.user?.email ||
            rawRow.email ||
            rawRow.user_email ||
            'N/A';

          teachersById.set(id, {
            id,
            name,
            email,
            role: row.role?.name || 'teacher'
          });
        }

        return Array.from(teachersById.values());
      }),
      catchError((error: HttpErrorResponse) => {
        const message =
          error.status === 0
            ? 'Request blocked by CORS or network. Verify API availability.'
            : error.error?.message ||
              error.message ||
              'Unable to load teachers. Please try again.';

        return throwError(() => new Error(message));
      })
    );
  }

  private unwrapArray<T>(response: CollectionResponse<T> | T[]): T[] {
    if (Array.isArray(response)) {
      return response;
    }

    return Array.isArray(response.data) ? response.data : [];
  }
}
