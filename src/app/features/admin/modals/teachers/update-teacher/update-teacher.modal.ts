import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProfileService, TeacherProfile } from '../../../../../shared/services/profile.service';

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
  currentEntity: TeacherProfile | null = null;

  form: TeacherProfile = {};

  constructor(private profileService: ProfileService) {}

  open(entity: TeacherProfile) {
    this.isOpen = true;
    this.currentEntity = entity;
    this.form = {
      teacher_id: entity.teacher_id,
      first_name: entity.first_name,
      middle_name: entity.middle_name || '',
      last_name: entity.last_name,
      department: entity.department || '',
      status: entity.status || 'active',
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
    if (!this.currentEntity?.user_id || !this.validate()) return;

    this.isLoading = true;
    this.profileService.updateTeacherProfile(this.currentEntity.user_id, this.form).subscribe({
      next: () => {
        this.isLoading = false;
        this.refresh.emit();
        this.close();
      },
      error: (error: any) => {
        this.isLoading = false;
        this.errorMessage = error.error?.message || 'Failed to update teacher profile';
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

