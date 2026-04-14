import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { finalize } from 'rxjs';
import { TeacherService } from '../../../services/teacher.service';
import { Teacher as TeacherModel } from '../../../models/teacher.model';

@Component({
  selector: 'app-teacher',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './teacher.html',
  styleUrl: './teacher.css'
})
export class Teacher implements OnInit {
  private readonly teacherService = inject(TeacherService);
  private readonly cdr = inject(ChangeDetectorRef);

  teachers: TeacherModel[] = [];
  isLoading = false;
  errorMessage = '';

  ngOnInit(): void {
    this.loadTeachers();
  }

  loadTeachers(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.teacherService.getTeachers().pipe(
      finalize(() => {
        this.isLoading = false;
        this.cdr.detectChanges();
      })
    ).subscribe({
      next: (teachers: TeacherModel[]) => {
        console.log('TEACHERS FROM API', teachers);
        this.teachers = teachers;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (error: Error) => {
        console.error('TEACHERS API ERROR', error);
        this.errorMessage = error.message;
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  trackByTeacherId(_: number, teacher: TeacherModel): string {
    return teacher.id;
  }
}
