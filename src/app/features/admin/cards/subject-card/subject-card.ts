import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject } from '../../models/subject.model';

@Component({
  selector: 'app-subject-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './subject-card.html',
  styleUrl: './subject-card.css',
})
export class SubjectCard {
  @Input() subject!: Subject;
}
