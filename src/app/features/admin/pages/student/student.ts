import { Component, OnInit, ViewChild, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Student as StudentModel } from '../../models/student.model';
import { StudentsService } from '../../services/students.service';
import { StudentCard } from '../../cards/student-card/student-card';
import { UpdateStudentModalComponent } from '../../modals/students/update-student/update-student.modal';
import { DeleteStudentModalComponent } from '../../modals/students/delete-student/delete-student.modal';

@Component({
  selector: 'app-student',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    StudentCard,
    UpdateStudentModalComponent,
    DeleteStudentModalComponent
  ],
  templateUrl: './student.html',
  styleUrl: './student.css',
})
export class Student implements OnInit {
  private readonly destroyRef = inject(DestroyRef);

  @ViewChild(UpdateStudentModalComponent) updateModal!: UpdateStudentModalComponent;
  @ViewChild(DeleteStudentModalComponent) deleteModal!: DeleteStudentModalComponent;

  students: StudentModel[] = [];
  isLoading = false;
  errorMessage = '';
  searchQuery = '';
  statusFilter: StudentModel['status'] | '' = '';

  constructor(private studentService: StudentsService) {}

ngOnInit() {
    this.loadStudents({ page: 1, per_page: 25 });
  }

  loadStudents(params: { page?: number; per_page?: number } = { page: 1, per_page: 25 }) {
    this.errorMessage = '';
    this.isLoading = true;
    this.studentService.list(params).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (response: any) => {
        console.log('[Students] API response:', response);
        let mapped: StudentModel[] = [];
        let data = Array.isArray(response) ? response : response.data ?? [];
        if (Array.isArray(data)) {
          mapped = data.map((item: any) => ({
            id: item.id ?? item.student_id ?? null,
            student_no: item.student_no ?? '',
            first_name: item.first_name ?? '',
            middle_name: item.middle_name ?? null,
            last_name: item.last_name ?? '',
            email: item.email ?? null,
            program_id: item.program_id ?? null,
            year_level: item.year_level ?? null,
            status: item.status ?? 'inactive',
            user_id: item.user_id ?? null,
            program: item.program ?? null,
            created_at: item.created_at ?? null,
            updated_at: item.updated_at ?? null
          }));
        }
        this.students = mapped;
        this.studentService.setCachedStudents(mapped);
        this.isLoading = false;
      },
      error: (error) => {
        console.error('[Students] API error:', error);
        if (error?.status === 404) {
          this.students = [];
          this.isLoading = false;
          return;
        }
        this.errorMessage = this.getErrorMessage(error) || 'Failed to load students';
        this.isLoading = false;
      }
    });
  }

  getFilteredStudents(): StudentModel[] {
    let filtered = this.students;

    if (this.searchQuery.trim()) {
      const query = this.searchQuery.toLowerCase();
      filtered = filtered.filter(student =>
        [
          student.id,
          student.student_no,
          this.getFullName(student),
          student.email ?? '',
          student.program?.name ?? '',
          student.program?.code ?? '',
          student.program_id,
          student.year_level,
          student.status,
          student.user_id ?? ''
        ]
          .join(' ')
          .toLowerCase()
          .includes(query)
      );
    }

    if (this.statusFilter) {
      filtered = filtered.filter(student => student.status === this.statusFilter);
    }

    return filtered;
  }

  getFullName(student: StudentModel): string {
    return [student.first_name, student.middle_name, student.last_name]
      .filter(Boolean)
      .join(' ');
  }

  getProgramLabel(student: StudentModel): string {
    return student.program?.name || student.program?.code || `Program #${student.program_id}`;
  }

  trackByStudentId(_: number, student: StudentModel): number {
    return student.id;
  }

  openUpdateModal(student: StudentModel): void {
    this.updateModal.open(student);
  }

  openDeleteModal(student: StudentModel): void {
    this.deleteModal.open(student);
  }

  private getErrorMessage(error: unknown): string | null {
    const apiError = error as {
      error?: {
        message?: string;
        errors?: Record<string, string[]>;
      };
    };

    const validationErrors = apiError?.error?.errors;

    if (validationErrors) {
      for (const messages of Object.values(validationErrors)) {
        if (Array.isArray(messages) && typeof messages[0] === 'string') {
          return messages[0];
        }
      }
    }

    return apiError?.error?.message ?? null;
  }
}
