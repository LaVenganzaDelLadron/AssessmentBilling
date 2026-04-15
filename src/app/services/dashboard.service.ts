import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin, map, of, catchError, timeout } from 'rxjs';
import { environment } from '../../environments/assessment/environment';
import { ProgramService } from './program.service';
import { StudentService } from './student.service';
import { TeacherService } from './teacher.service';
import { SubjectService } from './subject.service';
import { FeesService } from './fees.service';
import { BillingService } from './billing.service';
import { TeacherSubjectService } from './teacher-subject.service';
import { Billing } from '../models/billing.model';

interface CollectionResponse<T> {
  message?: string;
  data: T[];
}

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private readonly apiUrl = environment.apiUrl;

  constructor(
    private readonly http: HttpClient,
    private readonly programService: ProgramService,
    private readonly studentService: StudentService,
    private readonly teacherService: TeacherService,
    private readonly subjectService: SubjectService,
    private readonly feesService: FeesService,
    private readonly billingService: BillingService,
    private readonly teacherSubjectService: TeacherSubjectService
  ) {}

  getDashboardData(): Observable<{
    programsCount: number;
    studentsCount: number;
    teachersCount: number;
    subjectsCount: number;
    teacherSubjectsCount: number;
    assignmentsCount: number;
    gradesCount: number;
    feesCount: number;
    billingsCount: number;
    paidCount: number;
    partialCount: number;
    unpaidCount: number;
    totalBilled: number;
    unpaidAmount: number;
    recentBillings: Billing[];
  }> {
    return forkJoin({
      programs: this.programService.getPrograms().pipe(catchError(() => of([]))),
      students: this.studentService.getStudents().pipe(catchError(() => of([]))),
      teachers: this.teacherService.getTeachers().pipe(catchError(() => of([]))),
      subjects: this.subjectService.getSubjects().pipe(catchError(() => of([]))),
      teacherSubjects: this.teacherSubjectService.getTeacherSubjects().pipe(catchError(() => of([]))),
      assignments: this.http
        .get<CollectionResponse<unknown> | unknown[]>(`${this.apiUrl}/assignment`)
        .pipe(map((r) => this.unwrapArray(r)), catchError(() => of([]))),
      grades: this.http
        .get<CollectionResponse<unknown> | unknown[]>(`${this.apiUrl}/grade`)
        .pipe(map((r) => this.unwrapArray(r)), catchError(() => of([]))),
      fees: this.feesService.getFees().pipe(catchError(() => of([]))),
      billings: this.billingService.getBillings().pipe(catchError(() => of([])))
    }).pipe(
      timeout(20000),
      map(({ programs, students, teachers, subjects, teacherSubjects, assignments, grades, fees, billings }) => {
        const paid = billings.filter((b) => (b.status || '').toLowerCase() === 'paid');
        const partial = billings.filter((b) => (b.status || '').toLowerCase() === 'partial');
        const unpaid = billings.filter((b) => (b.status || '').toLowerCase() === 'unpaid');

        const totalBilled = billings.reduce((sum, b) => sum + Number(b.total_amount || 0), 0);
        const unpaidAmount = [...partial, ...unpaid].reduce((sum, b) => sum + Number(b.total_amount || 0), 0);

        const recentBillings = [...billings]
          .sort((a, b) => {
            const aTime = new Date(a.created_at || a.billing_date || 0).getTime();
            const bTime = new Date(b.created_at || b.billing_date || 0).getTime();
            return bTime - aTime;
          });

        return {
          programsCount: programs.length,
          studentsCount: students.length,
          teachersCount: teachers.length,
          subjectsCount: subjects.length,
          teacherSubjectsCount: teacherSubjects.length,
          assignmentsCount: assignments.length,
          gradesCount: grades.length,
          feesCount: fees.length,
          billingsCount: billings.length,
          paidCount: paid.length,
          partialCount: partial.length,
          unpaidCount: unpaid.length,
          totalBilled,
          unpaidAmount,
          recentBillings
        };
      })
    );
  }

  private unwrapArray<T>(response: CollectionResponse<T> | T[]): T[] {
    if (Array.isArray(response)) {
      return response;
    }

    return Array.isArray(response?.data) ? response.data : [];
  }
}
