import { Component, ViewChild, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProgramsService } from '../../../../../shared/services/programs.service';

@Component({
  selector: 'app-delete-programs-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './delete-programs.modal.html',
  styleUrl: './delete-programs.modal.css'
})
export class DeleteProgramsModalComponent implements OnInit {
  @ViewChild('modal') modal: any;
  @Output() refresh = new EventEmitter<void>();

  isOpen = false;
  isLoading = false;
  errorMessage = '';

  currentEntity: any = null;

  constructor(private programsService: ProgramsService) {}

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

    this.programsService.delete(this.currentEntity.id).subscribe({
      next: () => {
        this.isLoading = false;
        this.close();
        this.refresh.emit();
      },
      error: (error: any) => {
        this.isLoading = false;
        this.errorMessage = error?.message || 'Failed to delete program';
      }
    });
  }

  private resetForm(): void {
    this.errorMessage = '';
    this.currentEntity = null;
  }
}
