import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Student } from '../../models/student.model';

@Component({
  selector: 'app-student-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './student-card.html',
  styleUrl: './student-card.css',
})
export class StudentCard {
  @Input() student!: Student;
}
