import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Teacher } from '../../models/teacher.model';
import { TeachersService } from '../../services/teachers.service';
import { TeacherCard } from '../../cards/teacher-card/teacher-card';
import { UpdateTeacherModalComponent } from '../../modals/teachers/update-teacher/update-teacher.modal';
import { DeleteTeacherModalComponent } from '../../modals/teachers/delete-teacher/delete-teacher.modal';

@Component({
  selector: 'app-teachers',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TeacherCard,
    UpdateTeacherModalComponent,
    DeleteTeacherModalComponent
  ],
  templateUrl: './teachers.html',
  styleUrl: './teachers.css',
})
export class Teachers implements OnInit {
  @ViewChild(UpdateTeacherModalComponent) updateModal!: UpdateTeacherModalComponent;
  @ViewChild(DeleteTeacherModalComponent) deleteModal!: DeleteTeacherModalComponent;

  teachers: Teacher[] = [];
  // isLoading removed
  errorMessage = '';
  searchQuery = '';

  constructor(private teacherService: TeachersService) {}

  ngOnInit() {
    const cached = this.teacherService.getCachedTeachers();
    if (cached && cached.length > 0) {
      this.teachers = cached;
    } else {
      this.loadTeachers();
    }
  }

  loadTeachers() {
    this.errorMessage = '';
    this.teacherService.list().subscribe({
      next: (response: any) => {
        console.log('[Teachers] API response:', response);
        let mapped: Teacher[] = [];
        let data = Array.isArray(response) ? response : response.data ?? [];
        if (Array.isArray(data)) {
          mapped = data.map((item: any) => ({
            id: item.id ?? item.teacher_id ?? null,
            teacher_id: item.teacher_id ?? '',
            first_name: item.first_name ?? '',
            middle_name: item.middle_name ?? null,
            last_name: item.last_name ?? '',
            department: item.department ?? null,
            status: item.status ?? 'inactive',
            user_id: item.user_id ?? null,
            user: item.user ?? null,
            created_at: item.created_at ?? null,
            updated_at: item.updated_at ?? null
          }));
        }
        this.teachers = mapped;
        this.teacherService.setCachedTeachers(mapped);
      },
      error: (error) => {
        console.error('[Teachers] API error:', error);
        if (error?.status === 404) {
          this.teachers = [];
          return;
        }
        this.errorMessage = this.getErrorMessage(error) || 'Failed to load teachers';
      }
    });
  }

  getFilteredTeachers(): Teacher[] {
    if (!this.searchQuery) return this.teachers;
    const q = this.searchQuery.toLowerCase();
    return this.teachers.filter(teacher =>
      [
        teacher.id,
        teacher.teacher_id,
        this.getFullName(teacher),
        teacher.department ?? '',
        teacher.user_id,
        teacher.status,
        teacher.user?.name ?? '',
        teacher.user?.email ?? ''
      ]
        .join(' ')
        .toLowerCase()
        .includes(q)
    );
  }

  getFullName(teacher: Teacher): string {
    return [teacher.first_name, teacher.middle_name, teacher.last_name]
      .filter(Boolean)
      .join(' ');
  }

  trackByTeacherId(_: number, teacher: Teacher): number {
    return teacher.id;
  }

  openUpdateModal(teacher: Teacher): void {
    this.updateModal.open(teacher);
  }

  openDeleteModal(teacher: Teacher): void {
    this.deleteModal.open(teacher);
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
