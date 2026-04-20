import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Student as StudentModel, StudentsService } from '../../../../../shared/services/students.service';

@Component({
  selector: 'app-update-student-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './update-student.modal.html',
  styleUrl: './update-student.modal.css'
})
export class UpdateStudentModalComponent {
  @Output() refresh = new EventEmitter<void>();

  isOpen = false;
  isLoading = false;
  errorMessage = '';
  currentEntity: StudentModel | null = null;

  form: Partial<StudentModel> = {};

  constructor(private service: StudentsService) {}

  open(entity: StudentModel) {
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
    this.service.update(this.currentEntity.id, this.form as StudentModel).subscribe({
      next: () => {
        this.isLoading = false;
        this.refresh.emit();
        this.close();
      },
      error: (error: any) => {
        this.isLoading = false;
        this.errorMessage = error.error?.message || 'Failed to update student';
      }
    });
  }

  validate(): boolean {
    if (!this.form.student_id_number || !this.form.program_id) {
      this.errorMessage = 'All fields are required';
      return false;
    }
    return true;
  }
}
