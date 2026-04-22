import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { TeacherAssessmentBreakdown } from '../../models/assessment-breakdown.model';

@Component({
  selector: 'app-teacher-assessment-breakdown-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './assessment-breakdown-card.html',
  styleUrl: './assessment-breakdown-card.css',
})
export class TeacherAssessmentBreakdownCard {
  @Input({ required: true }) breakdown!: TeacherAssessmentBreakdown;
  @Output() editRequested = new EventEmitter<TeacherAssessmentBreakdown>();
  @Output() deleteRequested = new EventEmitter<TeacherAssessmentBreakdown>();

  requestEdit(): void {
    this.editRequested.emit(this.breakdown);
  }

  requestDelete(): void {
    this.deleteRequested.emit(this.breakdown);
  }
}
