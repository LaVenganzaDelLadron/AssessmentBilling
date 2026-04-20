import { Component, ViewChild, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AssessmentsService } from '../../../../../shared/services/assessments.service';

@Component({
  selector: 'app-delete-assessments-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './delete-assessments.modal.html',
  styleUrl: './delete-assessments.modal.css'
})
export class DeleteAssessmentsModalComponent implements OnInit {
  @ViewChild('modal') modal: any;
  @Output() refresh = new EventEmitter<void>();

  isOpen = false;
  isLoading = false;
  errorMessage = '';

  currentEntity: any = null;

  constructor(private assessmentsService: AssessmentsService) {}

  ngOnInit(): void {}

  open(entity: any): void {
    this.currentEntity = entity;
    this.isOpen = true;
  }

  close(): void {
    this.isOpen = false;
    this.resetForm();
  }

  submit(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.assessmentsService.delete(this.currentEntity.id).subscribe({
      next: () => {
        this.isLoading = false;
        this.close();
        this.refresh.emit();
      },
      error: (error: any) => {
        this.isLoading = false;
        this.errorMessage = error?.message || 'Failed to delete assessment';
      }
    });
  }

  private resetForm(): void {
    this.errorMessage = '';
    this.currentEntity = null;
  }
}
