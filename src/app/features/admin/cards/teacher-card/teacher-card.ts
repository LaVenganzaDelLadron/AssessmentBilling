import { Component, EventEmitter, Input, Output } from '@angular/core';
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
  @Output() editRequested = new EventEmitter<Teacher>();
  @Output() deleteRequested = new EventEmitter<Teacher>();

  requestEdit(): void {
    this.editRequested.emit(this.teacher);
  }

  requestDelete(): void {
    this.deleteRequested.emit(this.teacher);
  }
}
