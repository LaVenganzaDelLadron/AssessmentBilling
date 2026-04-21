import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  Student as StudentModel,
  UpdateStudentPayload
} from '../../../models/student.model';
import { StudentsService } from '../../../services/students.service';

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

  form: UpdateStudentPayload = {};

  constructor(private service: StudentsService) {}

  open(entity: StudentModel) {
    this.isOpen = true;
    this.currentEntity = entity;
    this.form = {
      student_no: entity.student_no,
      first_name: entity.first_name,
      middle_name: entity.middle_name,
      last_name: entity.last_name,
      email: entity.email ?? null,
      program_id: entity.program_id,
      year_level: entity.year_level,
      status: entity.status,
      user_id: entity.user_id
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
    this.service.update(this.currentEntity.id, this.form).subscribe({
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
    if (!this.form.student_no?.trim()) {
      this.errorMessage = 'Student number is required';
      return false;
    }
    if (!this.form.first_name?.trim() || !this.form.last_name?.trim()) {
      this.errorMessage = 'Student first and last name are required';
      return false;
    }
    if (!this.form.program_id || !this.form.year_level) {
      this.errorMessage = 'Program and year level are required';
      return false;
    }
    if (!this.form.status) {
      this.errorMessage = 'Status is required';
      return false;
    }
    return true;
  }
}
