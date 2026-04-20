import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Student as StudentModel, StudentsService } from '../../../../../shared/services/students.service';

@Component({
  selector: 'app-add-student-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './add-student.modal.html',
  styleUrl: './add-student.modal.css'
})
export class AddStudentModalComponent {
  @Output() refresh = new EventEmitter<void>();

  isOpen = false;
  isLoading = false;
  errorMessage = '';

  form: Partial<StudentModel> = {
    user_id: undefined,
    student_id_number: '',
    program_id: undefined
  };

  constructor(private service: StudentsService) {}

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
      student_id_number: '',
      program_id: undefined
    };
    this.errorMessage = '';
  }

  submit() {
    if (!this.validate()) return;

    this.isLoading = true;
    this.service.create(this.form as StudentModel).subscribe({
      next: () => {
        this.isLoading = false;
        this.refresh.emit();
        this.close();
      },
      error: (error: any) => {
        this.isLoading = false;
        this.errorMessage = error.error?.message || 'Failed to create student';
      }
    });
  }

  validate(): boolean {
    if (!this.form.user_id || !this.form.student_id_number || !this.form.program_id) {
      this.errorMessage = 'All fields are required';
      return false;
    }
    return true;
  }
}
