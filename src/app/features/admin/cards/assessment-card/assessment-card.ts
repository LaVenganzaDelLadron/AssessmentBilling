import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule, TitleCasePipe } from '@angular/common';
import { Assessment } from '../../models/assessment.model';

@Component({
  selector: 'app-assessment-card',
  standalone: true,
  imports: [CommonModule, TitleCasePipe],
  templateUrl: './assessment-card.html',
  styleUrl: './assessment-card.css',
})
export class AssessmentCard {
  @Input() assessment!: Assessment;
  @Output() editRequested = new EventEmitter<Assessment>();
  @Output() deleteRequested = new EventEmitter<Assessment>();

  requestEdit(): void {
    this.editRequested.emit(this.assessment);
  }

  requestDelete(): void {
    this.deleteRequested.emit(this.assessment);
  }
}
