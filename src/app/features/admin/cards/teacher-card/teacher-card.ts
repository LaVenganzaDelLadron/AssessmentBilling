import { Component, Input } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { Teacher } from '../../models/teacher.model';

@Component({
  selector: 'app-teacher-card',
  standalone: true,
  imports: [CommonModule, DatePipe],
  templateUrl: './teacher-card.html',
  styleUrl: './teacher-card.css',
})
export class TeacherCard {
  @Input() teacher!: Teacher;
}
