import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { StudentScholarship } from '../../models/scholarship.model';

@Component({
  selector: 'app-student-scholarships-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './student-scholarships-card.html',
  styleUrl: './student-scholarships-card.css',
})
export class StudentScholarshipsCard {
  @Input({ required: true }) record!: StudentScholarship;
  @Output() editRequested = new EventEmitter<StudentScholarship>();
  @Output() deleteRequested = new EventEmitter<StudentScholarship>();

  get studentLabel(): string {
    const student = this.record.student;
    if (!student) {
      return this.record.student_id ? `Student #${this.record.student_id}` : 'Unassigned student';
    }

    const name = [student.first_name, student.middle_name, student.last_name]
      .filter((part) => !!part?.trim())
      .join(' ')
      .trim();

    if (name) {
      return name;
    }

    return this.record.student_id ? `Student #${this.record.student_id}` : 'Unassigned student';
  }

  get studentMeta(): string {
    const studentNo = this.record.student?.student_no?.trim();
    if (studentNo) {
      return studentNo;
    }

    return this.record.student_id ? `ID ${this.record.student_id}` : 'No student number';
  }

  get scholarshipLabel(): string {
    return this.record.scholarship?.name?.trim()
      || (this.record.scholarship_id ? `Scholarship #${this.record.scholarship_id}` : 'No scholarship');
  }

  get discountDisplay(): string {
    const value = Number(this.record.discount_value);

    if (this.record.discount_type === 'percent') {
      return `${Number.isNaN(value) ? this.record.discount_value : value}%`;
    }

    return this.formatCurrency(this.record.discount_value);
  }

  get appliedDateDisplay(): string {
    return this.record.applied_at || this.record.created_at || '';
  }

  requestEdit(): void {
    this.editRequested.emit(this.record);
  }

  requestDelete(): void {
    this.deleteRequested.emit(this.record);
  }

  formatCurrency(value: number | string | null | undefined): string {
    const numericValue = Number(value ?? 0);

    if (Number.isNaN(numericValue)) {
      return String(value ?? 'N/A');
    }

    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(numericValue);
  }
}
