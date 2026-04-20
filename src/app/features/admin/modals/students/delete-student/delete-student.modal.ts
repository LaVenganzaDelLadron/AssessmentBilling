import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Student as StudentModel, StudentsService } from '../../../../../shared/services/students.service';

@Component({
  selector: 'app-delete-student-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './delete-student.modal.html',
  styleUrl: './delete-student.modal.css'
})
export class DeleteStudentModalComponent {
  @Output() refresh = new EventEmitter<void>();

  isOpen = false;
  isLoading = false;
  errorMessage = '';
  entityId: number | null = null;

  constructor(private service: StudentsService) {}

  open(entity: StudentModel) {
    this.isOpen = true;
    this.entityId = entity.id || null;
    this.errorMessage = '';
  }

  close() {
    this.isOpen = false;
  }

  confirmDelete() {
    if (!this.entityId) return;

    this.isLoading = true;
    this.service.delete(this.entityId).subscribe({
      next: () => {
        this.isLoading = false;
        this.refresh.emit();
        this.close();
      },
      error: (error: any) => {
        this.isLoading = false;
        this.errorMessage = error.error?.message || 'Failed to delete';
      }
    });
  }
}
