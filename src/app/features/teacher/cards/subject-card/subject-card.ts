import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { TeacherSubject } from '../../models/subject.model';

@Component({
  selector: 'app-teacher-subject-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './subject-card.html',
  styleUrl: './subject-card.css',
})
export class TeacherSubjectCard {
  @Input({ required: true }) subject!: TeacherSubject;

  getProgramLabel(): string {
    return this.subject.program_name?.trim() || this.subject.program?.name?.trim() || 'Program not assigned';
  }
}
