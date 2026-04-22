import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Enrollment } from '../../models/enrollment.model';

@Component({
  selector: 'app-enrollment-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './enrollment-card.html',
  styleUrl: './enrollment-card.css',
})
export class EnrollmentCard {
  @Input() enrollment!: Enrollment;
  @Output() editRequested = new EventEmitter<Enrollment>();
  @Output() deleteRequested = new EventEmitter<Enrollment>();

  getStudentDisplay(): string {
    const studentName = this.enrollment.student?.name?.trim();
    if (studentName) {
      return studentName;
    }

    if (this.enrollment.student_id) {
      return `Student #${this.enrollment.student_id}`;
    }

    return 'Student not available';
  }

  getSubjectDisplay(): string {
    const subjectNames = (this.enrollment.subjects ?? [])
      .map((subject) => subject.name?.trim())
      .filter((name): name is string => Boolean(name));

    if (subjectNames.length > 0) {
      return subjectNames.join(', ');
    }

    const singleSubjectName = this.enrollment.subject_name?.trim();
    if (singleSubjectName) {
      return singleSubjectName;
    }

    if (this.enrollment.subject_id) {
      return `Subject #${this.enrollment.subject_id}`;
    }

    return 'No subjects found';
  }

  getSemesterDisplay(): string {
    return (
      this.enrollment.academic_term?.semester?.trim() ||
      this.enrollment.semester?.trim() ||
      'N/A'
    );
  }

  getAcademicTermDisplay(): string {
    const academicYear = this.enrollment.academic_term?.school_year?.trim();
    if (academicYear) {
      return academicYear;
    }

    const fallbackYear = this.enrollment.school_year?.trim();
    if (fallbackYear) {
      return fallbackYear;
    }

    if (this.enrollment.academic_term?.id) {
      return `Term #${this.enrollment.academic_term.id}`;
    }
    if (this.enrollment.academic_term_id) {
      return `Term #${this.enrollment.academic_term_id}`;
    }
    return 'N/A';
  }

  canManageEnrollment(): boolean {
    return Boolean(
      (typeof this.enrollment.id === 'number' && this.enrollment.id > 0) ||
      this.enrollment.student_id ||
      this.enrollment.subject_id ||
      this.enrollment.academic_term_id
    );
  }

  requestEdit(): void {
    if (this.enrollment.id == null || this.enrollment.id <= 0) {
      console.warn('[EnrollmentCard] Edit requested without a valid enrollment id', this.enrollment);
    }
    this.editRequested.emit(this.enrollment);
  }

  requestDelete(): void {
    if (this.enrollment.id == null || this.enrollment.id <= 0) {
      console.warn('[EnrollmentCard] Delete requested without a valid enrollment id', this.enrollment);
    }
    this.deleteRequested.emit(this.enrollment);
  }
}
