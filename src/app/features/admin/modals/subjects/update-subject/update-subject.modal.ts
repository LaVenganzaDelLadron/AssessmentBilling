import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, SubjectsService } from '../../../../../shared/services/subjects.service';

@Component({
  selector: 'app-update-subject-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './update-subject.modal.html',
  styleUrl: './update-subject.modal.css'
})
export class UpdateSubjectModalComponent {
  @Output() refresh = new EventEmitter<void>();

  isOpen = false;
  isLoading = false;
  errorMessage = '';
  currentEntity: Subject | null = null;

  form: Partial<Subject> = {};

  constructor(private service: SubjectsService) {}

  open(entity: Subject) {
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
    this.service.update(this.currentEntity.id, this.form as Subject).subscribe({
      next: () => {
        this.isLoading = false;
        this.refresh.emit();
        this.close();
      },
      error: (error: any) => {
        this.isLoading = false;
        this.errorMessage = error.error?.message || 'Failed to update subject';
      }
    });
  }

  validate(): boolean {
    if (!this.form.subject_name || !this.form.subject_code) {
      this.errorMessage = 'All fields are required';
      return false;
    }
    return true;
  }
}
