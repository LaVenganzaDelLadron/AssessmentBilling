import { Component, Input } from '@angular/core';
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
}
