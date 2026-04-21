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

  requestEdit(): void {
    this.editRequested.emit(this.enrollment);
  }

  requestDelete(): void {
    this.deleteRequested.emit(this.enrollment);
  }
}
