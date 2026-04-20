import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject, SubjectsService } from '../../../../../shared/services/subjects.service';

@Component({
  selector: 'app-delete-subject-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './delete-subject.modal.html',
  styleUrl: './delete-subject.modal.css'
})
export class DeleteSubjectModalComponent {
  @Output() refresh = new EventEmitter<void>();

  isOpen = false;
  isLoading = false;
  errorMessage = '';
  entityId: number | null = null;

  constructor(private service: SubjectsService) {}

  open(entity: Subject) {
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
