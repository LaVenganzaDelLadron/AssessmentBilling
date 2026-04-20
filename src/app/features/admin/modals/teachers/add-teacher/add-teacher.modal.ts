import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Teacher, TeachersService } from '../../../../../shared/services/teachers.service';

@Component({
  selector: 'app-add-teacher-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './add-teacher.modal.html',
  styleUrl: './add-teacher.modal.css'
})
export class AddTeacherModalComponent {
  @Output() refresh = new EventEmitter<void>();

  isOpen = false;
  isLoading = false;
  errorMessage = '';

  form: Partial<Teacher> = {
    user_id: undefined,
    employee_id: ''
  };

  constructor(private service: TeachersService) {}

  open() {
    this.isOpen = true;
    this.resetForm();
  }

  close() {
    this.isOpen = false;
  }

  resetForm() {
    this.form = {
      user_id: undefined,
      employee_id: ''
    };
    this.errorMessage = '';
  }

  submit() {
    if (!this.validate()) return;

    this.isLoading = true;
    this.service.create(this.form as Teacher).subscribe({
      next: () => {
        this.isLoading = false;
        this.refresh.emit();
        this.close();
      },
      error: (error: any) => {
        this.isLoading = false;
        this.errorMessage = error.error?.message || 'Failed to create teacher';
      }
    });
  }

  validate(): boolean {
    if (!this.form.user_id || !this.form.employee_id) {
      this.errorMessage = 'All fields are required';
      return false;
    }
    return true;
  }
}
