import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule, TitleCasePipe } from '@angular/common';
import { AssessmentBreakdown } from '../../models/assessment-breakdown.model';

@Component({
  selector: 'app-assessment-breakdown-card',
  standalone: true,
  imports: [CommonModule, TitleCasePipe],
  templateUrl: './assessment-breakdown-card.html',
  styleUrl: './assessment-breakdown-card.css',
})
export class AssessmentBreakdownCard {
  @Input() breakdown!: AssessmentBreakdown;
  @Output() editRequested = new EventEmitter<AssessmentBreakdown>();
  @Output() deleteRequested = new EventEmitter<AssessmentBreakdown>();

  requestEdit(): void {
    this.editRequested.emit(this.breakdown);
  }

  requestDelete(): void {
    this.deleteRequested.emit(this.breakdown);
  }

  formatNumericValue(value: number | undefined): string {
    return value?.toString() || '—';
  }

  formatAmount(value: number | undefined): string {
    return value ? `₱${value.toLocaleString()}` : '—';
  }
}

