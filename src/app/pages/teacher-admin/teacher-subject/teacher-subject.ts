import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';
import { AuthService } from '../../../core/auth.service';
import { TeacherService } from '../../../services/teacher.service';
import { SubjectService } from '../../../services/subject.service';
import { TeacherSubjectService } from '../../../services/teacher-subject.service';
import { Teacher } from '../../../models/teacher.model';
import { Subject } from '../../../models/subject.model';
import {
  TeacherSubject,
  TeacherSubjectPayload
} from '../../../models/teacher-subject.model';

@Component({
  selector: 'app-teacher-subject',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './teacher-subject.html',
  styleUrl: './teacher-subject.css'
})
export class TeacherSubjectComponent implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly teacherService = inject(TeacherService);
  private readonly subjectService = inject(SubjectService);
  private readonly teacherSubjectService = inject(TeacherSubjectService);
  private readonly cdr = inject(ChangeDetectorRef);

  teachers: Teacher[] = [];
  subjects: Subject[] = [];
  assignments: TeacherSubject[] = [];

  form: TeacherSubjectPayload = {
    teacher_id: '',
    subject_id: ''
  };

  isLoading = false;
  isSubmitting = false;
  errorMessage = '';
  successMessage = '';
  readonly isTeacherView = this.authService.getCurrentRole() === 'teacher';
  private readonly currentUserId = this.authService.getCurrentUserId();

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.isLoading = true;
    this.errorMessage = '';

    // Teacher role can only access /teacher-subject (not admin-only endpoints like /subject, /user-role).
    if (!this.isTeacherView) {
      this.teacherService.getTeachers().subscribe({
        next: (teachers) => {
          this.teachers = teachers;
          this.cdr.detectChanges();
        },
        error: (error: Error) => {
          this.errorMessage = error.message;
          this.cdr.detectChanges();
        }
      });

      this.subjectService.getSubjects().subscribe({
        next: (subjects) => {
          this.subjects = subjects;
          this.cdr.detectChanges();
        },
        error: (error: Error) => {
          this.errorMessage = error.message;
          this.cdr.detectChanges();
        }
      });
    }

    this.teacherSubjectService.getTeacherSubjects().pipe(
      finalize(() => {
        this.isLoading = false;
        this.cdr.detectChanges();
      })
    ).subscribe({
      next: (rows) => {
        this.assignments = this.filterAssignmentsForView(rows);
        this.cdr.detectChanges();
      },
      error: (error: Error) => {
        this.errorMessage = error.message;
        this.cdr.detectChanges();
      }
    });
  }

  submit(): void {
    if (this.isTeacherView) {
      return;
    }

    if (!this.form.teacher_id || !this.form.subject_id) {
      this.errorMessage = 'Please select both teacher and subject.';
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.teacherSubjectService.assignSubject(this.form).pipe(
      finalize(() => {
        this.isSubmitting = false;
        this.cdr.detectChanges();
      })
    ).subscribe({
      next: () => {
        this.successMessage = 'Subject assigned to teacher successfully.';
        this.form = { teacher_id: '', subject_id: '' };
        this.loadAssignments();
      },
      error: (error: Error) => {
        this.errorMessage = error.message;
      }
    });
  }

  remove(id: string): void {
    if (this.isTeacherView) {
      return;
    }

    this.teacherSubjectService.deleteAssignment(id).subscribe({
      next: () => {
        this.successMessage = 'Assignment removed successfully.';
        this.loadAssignments();
      },
      error: (error: Error) => {
        this.errorMessage = error.message;
      }
    });
  }

  loadAssignments(): void {
    this.teacherSubjectService.getTeacherSubjects().subscribe({
      next: (rows) => {
        this.assignments = this.filterAssignmentsForView(rows);
        this.cdr.detectChanges();
      },
      error: (error: Error) => {
        this.errorMessage = error.message;
        this.cdr.detectChanges();
      }
    });
  }

  private filterAssignmentsForView(rows: TeacherSubject[]): TeacherSubject[] {
    if (!this.isTeacherView) {
      return rows;
    }

    if (!this.currentUserId) {
      return rows;
    }

    return rows.filter((row) => {
      const teacherId = row.teacher?.id || row.teacher_id;
      return String(teacherId) === String(this.currentUserId);
    });
  }

  teacherName(row: TeacherSubject): string {
    if (this.isTeacherView) {
      return this.authService.getUserDisplayName('Teacher');
    }

    return (
      row.teacher?.name ||
      this.teachers.find((t) => t.id === row.teacher_id)?.name ||
      row.teacher_id
    );
  }

  subjectCode(row: TeacherSubject): string {
    const subject = this.extractSubject(row);
    const rowCode = this.readString(row, 'subject_code');
    if (rowCode) {
      return rowCode;
    }

    if (subject?.code) {
      return subject.code;
    }
    if (subject?.subject_code) {
      return subject.subject_code;
    }

    const found = this.findSubject(this.subjectLookupKey(row));
    return found?.code || found?.subject_code || this.subjectLookupKey(row);
  }

  subjectName(row: TeacherSubject): string {
    const subject = this.extractSubject(row);
    const rowName = this.readString(row, 'subject_name');
    if (rowName) {
      return rowName;
    }

    if (subject?.name) {
      return subject.name;
    }
    if (subject?.subject_name) {
      return subject.subject_name;
    }

    const found = this.findSubject(this.subjectLookupKey(row));
    return found?.name || found?.subject_name || 'No subject name';
  }

  subjectOptionCode(subject: Subject): string {
    return subject.code || subject.subject_code || String(subject.id);
  }

  subjectOptionName(subject: Subject): string {
    return subject.name || subject.subject_name || String(subject.id);
  }

  trackByAssignmentId(_: number, item: TeacherSubject): string {
    return item.id;
  }

  private findSubject(subjectRef: string): Subject | undefined {
    const normalizedRef = String(subjectRef || '').trim();
    if (!normalizedRef) {
      return undefined;
    }

    return this.subjects.find((s) => {
      const id = String(s.id || '').trim();
      const code = String(s.code || '').trim();
      const subjectCode = String(s.subject_code || '').trim();
      return normalizedRef === id || normalizedRef === code || normalizedRef === subjectCode;
    });
  }

  private extractSubject(row: TeacherSubject): Partial<Subject> | null {
    const raw = (row as { subject?: unknown }).subject;

    if (Array.isArray(raw) && raw.length > 0 && typeof raw[0] === 'object' && raw[0] !== null) {
      return raw[0] as Partial<Subject>;
    }

    if (raw && typeof raw === 'object') {
      return raw as Partial<Subject>;
    }

    return null;
  }

  private subjectLookupKey(row: TeacherSubject): string {
    const rowCode = this.readString(row, 'subject_code');
    if (rowCode) {
      return rowCode;
    }

    const raw = (row as { subject?: unknown }).subject;
    if (typeof raw === 'string' && raw.trim()) {
      return raw.trim();
    }

    return String(row.subject_id || '').trim();
  }

  private readString<T extends object>(obj: T, key: string): string | null {
    const value = (obj as Record<string, unknown>)[key];
    return typeof value === 'string' && value.trim() ? value.trim() : null;
  }
}
