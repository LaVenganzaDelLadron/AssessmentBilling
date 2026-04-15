import { Injectable } from '@angular/core';
import { Observable, catchError, forkJoin, map, of, timeout } from 'rxjs';
import { AuthService } from '../core/auth.service';
import { Assignment } from '../models/assignment.model';
import { TeacherSubject } from '../models/teacher-subject.model';
import { AssignmentService } from './assignment.service';
import { TeacherSubjectService } from './teacher-subject.service';

export interface TeacherDashboardData {
  teacherName: string;
  assignedSubjectsCount: number;
  totalAssignmentsCount: number;
  dueThisWeekCount: number;
  nextDueDate: string | null;
  upcomingAssignments: Assignment[];
}

@Injectable({
  providedIn: 'root'
})
export class TeacherDashboardService {
  constructor(
    private readonly authService: AuthService,
    private readonly assignmentService: AssignmentService,
    private readonly teacherSubjectService: TeacherSubjectService
  ) {}

  getDashboardData(): Observable<TeacherDashboardData> {
    return forkJoin({
      assignments: this.assignmentService.getAssignments().pipe(catchError(() => of([]))),
      teacherSubjects: this.teacherSubjectService.getTeacherSubjects().pipe(catchError(() => of([])))
    }).pipe(
      timeout(15000),
      map(({ assignments, teacherSubjects }) => this.buildDashboardData(assignments, teacherSubjects))
    );
  }

  private buildDashboardData(assignments: Assignment[], teacherSubjects: TeacherSubject[]): TeacherDashboardData {
    const teacherName = this.authService.getUserDisplayName('Teacher');
    const currentUserId = this.authService.getCurrentUserId();

    const teacherRows = this.filterTeacherRows(teacherSubjects, currentUserId);
    const uniqueSubjects = this.extractSubjectSet(teacherRows);
    const myAssignments =
      uniqueSubjects.size > 0
        ? assignments.filter((assignment) =>
            uniqueSubjects.has(String(assignment.subject_id || '').trim())
          )
        : assignments;

    const today = new Date();
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const weekEnd = new Date(todayStart);
    weekEnd.setDate(weekEnd.getDate() + 7);

    const dueThisWeek = myAssignments.filter((assignment) => {
      const due = this.parseDate(assignment.due_date);
      return !!due && due >= todayStart && due <= weekEnd;
    });

    const upcomingAssignments = [...myAssignments]
      .filter((assignment) => {
        const due = this.parseDate(assignment.due_date);
        return !!due && due >= todayStart;
      })
      .sort((a, b) => this.parseDate(a.due_date)!.getTime() - this.parseDate(b.due_date)!.getTime())
      .slice(0, 6);

    return {
      teacherName,
      assignedSubjectsCount: uniqueSubjects.size,
      totalAssignmentsCount: myAssignments.length,
      dueThisWeekCount: dueThisWeek.length,
      nextDueDate: upcomingAssignments[0]?.due_date || null,
      upcomingAssignments
    };
  }

  private filterTeacherRows(rows: TeacherSubject[], currentUserId: string): TeacherSubject[] {
    const normalizedCurrentUserId = String(currentUserId || '').trim();
    if (!normalizedCurrentUserId) {
      return rows;
    }

    return rows.filter((row) => {
      const teacherId = String(row.teacher?.id || row.teacher_id || '').trim();
      return !teacherId || teacherId === normalizedCurrentUserId;
    });
  }

  private extractSubjectSet(rows: TeacherSubject[]): Set<string> {
    const subjectIds = new Set<string>();
    rows.forEach((row) => {
      const subjectId = String(row.subject_id || '').trim();
      if (subjectId) {
        subjectIds.add(subjectId);
      }
    });
    return subjectIds;
  }

  private parseDate(value: string): Date | null {
    if (!value) {
      return null;
    }

    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) {
      return null;
    }

    return new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate());
  }
}
