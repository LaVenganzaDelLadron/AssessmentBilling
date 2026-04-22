import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Scholarship } from '../../models/scholarship.model';

@Component({
  selector: 'app-scholarship-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './scholarship-card.html',
  styleUrl: './scholarship-card.css',
})
export class ScholarshipCard {
  @Input() scholarship!: Scholarship;
  @Output() editRequested = new EventEmitter<Scholarship>();
  @Output() deleteRequested = new EventEmitter<Scholarship>();

  getDiscountDisplay(): string {
    const value = Number(this.scholarship.discount_value);
    const safeValue = Number.isNaN(value) ? this.scholarship.discount_value : value;

    if (this.scholarship.discount_type === 'percent') {
      return `${safeValue}% discount`;
    }

    if (Number.isNaN(value)) {
      return `${safeValue} fixed discount`;
    }

    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  }

  getApplicationsCount(): number {
    return this.scholarship.student_scholarships?.length ?? 0;
  }

  getDescriptionDisplay(): string {
    const description = this.scholarship.description?.trim();
    return description && description.length > 0
      ? description
      : 'No scholarship description provided yet.';
  }

  getStatusLabel(): string {
    return this.scholarship.is_active ? 'Active' : 'Inactive';
  }

  requestEdit(): void {
    this.editRequested.emit(this.scholarship);
  }

  requestDelete(): void {
    this.deleteRequested.emit(this.scholarship);
  }
}
