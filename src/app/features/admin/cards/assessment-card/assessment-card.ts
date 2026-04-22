import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule, TitleCasePipe } from '@angular/common';
import { Assessment } from '../../models/assessment.model';

@Component({
  selector: 'app-assessment-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './assessment-card.html',
  styleUrl: './assessment-card.css',
})
export class AssessmentCard {
  @Input() assessment!: Assessment;
  @Output() editRequested = new EventEmitter<Assessment>();
  @Output() deleteRequested = new EventEmitter<Assessment>();

  getStudentDisplay(): string {
    const name = this.assessment.student_name?.trim();
    if (name) {
      return name;
    }
    return `Student #${this.assessment.student_id}`;
  }

  getTermDisplay(): string {
    const schoolYear = this.assessment.school_year?.trim();
    const semester = this.assessment.semester?.trim();
    if (schoolYear && semester) {
      return `${schoolYear} • ${semester}`;
    }
    if (schoolYear || semester) {
      return schoolYear || semester;
    }
    return `Term #${this.assessment.academic_term_id}`;
  }

  requestEdit(): void {
    this.editRequested.emit(this.assessment);
  }

  requestDelete(): void {
    this.deleteRequested.emit(this.assessment);
  }
}
