import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/assessment/environment';

export interface StudentProfile {
  id?: number;
  user_id: number;
  student_no: string;
  first_name: string;
  middle_name?: string;
  last_name: string;
  program_id: number;
  year_level: number;
  status: 'active' | 'inactive';
}

export interface TeacherProfile {
  id?: number;
  user_id: number;
  teacher_id: string;
  first_name: string;
  middle_name?: string;
  last_name: string;
  department?: string;
  status: 'active' | 'inactive';
}

export interface Program {
  id: number;
  name: string;
  code: string;
}

@Injectable({
  providedIn: 'root'
})
export class ProfileService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // Student Profile
  getStudentProfile(userId: number): Observable<StudentProfile> {
    return this.http.get<StudentProfile>(`${this.apiUrl}/student/profile/${userId}`);
  }

  updateStudentProfile(userId: number, data: StudentProfile): Observable<StudentProfile> {
    return this.http.put<StudentProfile>(`${this.apiUrl}/student/profile/${userId}`, data);
  }

  createStudentProfile(data: StudentProfile): Observable<StudentProfile> {
    return this.http.post<StudentProfile>(`${this.apiUrl}/student/profile`, data);
  }

  // Teacher Profile
  getTeacherProfile(): Observable<TeacherProfile> {
    return this.http.get<TeacherProfile>(`${this.apiUrl}/teacher/profile`);
  }

  updateTeacherProfile(data: TeacherProfile): Observable<TeacherProfile> {
    return this.http.put<TeacherProfile>(`${this.apiUrl}/teacher/profile`, data);
  }

  createTeacherProfile(data: TeacherProfile): Observable<TeacherProfile> {
    return this.http.post<TeacherProfile>(`${this.apiUrl}/teacher/profile`, data);
  }

  // Programs
  getPrograms(): Observable<Program[]> {
    return this.http.get<Program[]>(`${this.apiUrl}/programs`);
  }
}
