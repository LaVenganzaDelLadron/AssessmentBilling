import { Component, Input } from '@angular/core';
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
}
