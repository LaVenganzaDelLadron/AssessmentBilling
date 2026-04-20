import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, SubjectsService } from '../../../../../shared/services/subjects.service';

@Component({
  selector: 'app-add-subject-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './add-subject.modal.html',
  styleUrl: './add-subject.modal.css'
})
export class AddSubjectModalComponent {
  @Output() refresh = new EventEmitter<void>();

  isOpen = false;
  isLoading = false;
  errorMessage = '';

  form: Partial<Subject> = {
    program_id: undefined,
    subject_name: '',
    subject_code: ''
  };

  constructor(private service: SubjectsService) {}

  open() {
    this.isOpen = true;
    this.resetForm();
  }

  close() {
    this.isOpen = false;
  }

  resetForm() {
    this.form = {
      program_id: undefined,
      subject_name: '',
      subject_code: ''
    };
    this.errorMessage = '';
  }

  submit() {
    if (!this.validate()) return;

    this.isLoading = true;
    this.service.create(this.form as Subject).subscribe({
      next: () => {
        this.isLoading = false;
        this.refresh.emit();
        this.close();
      },
      error: (error: any) => {
        this.isLoading = false;
        this.errorMessage = error.error?.message || 'Failed to create subject';
      }
    });
  }

  validate(): boolean {
    if (!this.form.program_id || !this.form.subject_name || !this.form.subject_code) {
      this.errorMessage = 'All fields are required';
      return false;
    }
    return true;
  }
}
