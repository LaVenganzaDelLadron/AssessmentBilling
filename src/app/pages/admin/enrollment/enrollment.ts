import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { finalize } from 'rxjs';
import { Student } from '../../../models/student.model';
import { StudentService } from '../../../services/student.service';

@Component({
  selector: 'app-enrollment',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './enrollment.html',
  styleUrl: './enrollment.css'
})
export class Enrollment implements OnInit {
  private readonly studentService = inject(StudentService);
  private readonly cdr = inject(ChangeDetectorRef);

  students: Student[] = [];
  isLoading = false;
  errorMessage = '';

  ngOnInit(): void {
    this.loadStudents();
  }

  loadStudents(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.studentService.getStudents().pipe(
      finalize(() => {
        this.isLoading = false;
        this.cdr.detectChanges();
      })
    ).subscribe({
      next: (students: Student[]) => {
        console.log('STUDENTS FROM API', students);
        this.students = students;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (error: Error) => {
        console.error('STUDENTS API ERROR', error);
        this.errorMessage = error.message;
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  trackById(_: number, item: Student): string {
    return item.id;
  }
}
