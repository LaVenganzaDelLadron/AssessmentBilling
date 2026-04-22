import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { TeacherEnrollment } from '../../models/enrollment.model';

@Component({
  selector: 'app-teacher-enrollment-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './enrollment-card.html',
  styleUrl: './enrollment-card.css',
})
export class TeacherEnrollmentCard {
  @Input({ required: true }) enrollment!: TeacherEnrollment;

  getStudentLabel(): string {
    const student = this.enrollment.student;
    const fullName = [
      student?.first_name?.trim(),
      student?.middle_name?.trim(),
      student?.last_name?.trim()
    ].filter(Boolean).join(' ');

    return fullName || student?.name?.trim() || `Student #${this.enrollment.student_id}`;
  }

  getSubjectLabel(): string {
    const subjectNames = (this.enrollment.subjects ?? [])
      .map((subject) => subject.name?.trim())
      .filter((name): name is string => Boolean(name));

    return subjectNames[0] || this.enrollment.subject?.name?.trim() || this.enrollment.subject_name?.trim() || `Subject #${this.enrollment.subject_id}`;
  }
}
