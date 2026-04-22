import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { TeacherAssessment } from '../../models/assessment.model';

@Component({
  selector: 'app-teacher-assessment-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './assessment-card.html',
  styleUrl: './assessment-card.css',
})
export class TeacherAssessmentCard {
  @Input({ required: true }) assessment!: TeacherAssessment;
  @Output() editRequested = new EventEmitter<TeacherAssessment>();
  @Output() deleteRequested = new EventEmitter<TeacherAssessment>();

  requestEdit(): void {
    this.editRequested.emit(this.assessment);
  }

  requestDelete(): void {
    this.deleteRequested.emit(this.assessment);
  }
}
