import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Teacher } from '../../../models/teacher.model';
import { TeachersService } from '../../../services/teachers.service';

@Component({
  selector: 'app-delete-teacher-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './delete-teacher.modal.html',
  styleUrl: './delete-teacher.modal.css'
})
export class DeleteTeacherModalComponent {
  @Output() refresh = new EventEmitter<void>();

  isOpen = false;
  isLoading = false;
  errorMessage = '';
  entityId: number | null = null;

  constructor(private service: TeachersService) {}

  open(entity: Teacher) {
    this.isOpen = true;
    this.entityId = entity.id ?? null;
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
