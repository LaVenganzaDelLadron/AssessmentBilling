import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Teacher, TeachersService } from '../../../../../shared/services/teachers.service';

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

  form: Partial<Teacher> = {};

  constructor(private service: TeachersService) {}

  open(entity: Teacher) {
    this.isOpen = true;
    this.currentEntity = entity;
    this.form = { ...entity };
    this.errorMessage = '';
  }

  close() {
    this.isOpen = false;
  }

  submit() {
    if (!this.currentEntity?.id || !this.validate()) return;

    this.isLoading = true;
    this.service.update(this.currentEntity.id, this.form as Teacher).subscribe({
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
    if (!this.form.employee_id) {
      this.errorMessage = 'Employee ID is required';
      return false;
    }
    return true;
  }
}
