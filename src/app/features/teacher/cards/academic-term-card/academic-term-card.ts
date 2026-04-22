import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { TeacherAcademicTerm } from '../../models/academic-term.model';

@Component({
  selector: 'app-teacher-academic-term-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './academic-term-card.html',
  styleUrl: './academic-term-card.css',
})
export class TeacherAcademicTermCard {
  @Input({ required: true }) term!: TeacherAcademicTerm;
}
