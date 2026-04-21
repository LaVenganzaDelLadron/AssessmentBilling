import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TeachersService } from '../../../services/teachers.service';
import { Teacher } from '../../../models/teacher.model';

type UpdateTeacherPayload = Partial<Teacher>;

@Component({
  selector: 'app-update-teacher-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './update-teacher.modal.html',
  styleUrl: './update-teacher.modal.css'
})
export class UpdateTeacherModalComponent {
  @Output() refresh = new EventEmitter<void>();

  isOpen = false;
  isLoading = false;
  errorMessage = '';
  currentEntity: Teacher | null = null;

  form: UpdateTeacherPayload = {};

  constructor(private service: TeachersService) {}

  open(entity: Teacher) {
    this.isOpen = true;
    this.currentEntity = entity;
    this.form = {
      teacher_id: entity.teacher_id || '',
      first_name: entity.first_name || '',
      middle_name: entity.middle_name || '',
      last_name: entity.last_name || '',
      department: entity.department || '',
      status: entity.status || 'active'
    };
    this.errorMessage = '';
  }

  close() {
    this.isOpen = false;
    this.currentEntity = null;
    this.form = {};
    this.errorMessage = '';
  }

  submit() {
    if (!this.currentEntity?.id || !this.validate()) return;

    this.isLoading = true;
    this.service.update(this.currentEntity.id, this.form as any).subscribe({
      next: () => {
        this.isLoading = false;
        this.refresh.emit();
        this.close();
      },
      error: (error: any) => {
        this.isLoading = false;
        this.errorMessage = error.error?.message || 'Failed to update teacher';
      }
    });
  }

  validate(): boolean {
    if (!this.form.teacher_id?.trim()) {
      this.errorMessage = 'Teacher ID is required';
      return false;
    }
    if (!this.form.first_name?.trim() || !this.form.last_name?.trim()) {
      this.errorMessage = 'Teacher first and last name are required';
      return false;
    }
    if (!this.form.department?.trim()) {
      this.errorMessage = 'Department is required';
      return false;
    }
    if (!this.form.status) {
      this.errorMessage = 'Status is required';
      return false;
    }
    return true;
  }
}

