import { Component, EventEmitter, Input, Output } from '@angular/core';
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
  @Output() editRequested = new EventEmitter<Student>();
  @Output() deleteRequested = new EventEmitter<Student>();

  requestEdit(): void {
    this.editRequested.emit(this.student);
  }

  requestDelete(): void {
    this.deleteRequested.emit(this.student);
  }
}
