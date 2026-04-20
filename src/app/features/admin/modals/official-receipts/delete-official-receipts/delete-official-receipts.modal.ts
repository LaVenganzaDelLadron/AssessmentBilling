import { Component, ViewChild, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OfficialReceiptsService } from '../../../../../shared/services/official-receipts.service';

@Component({
  selector: 'app-delete-official-receipts-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './delete-official-receipts.modal.html',
  styleUrl: './delete-official-receipts.modal.css'
})
export class DeleteOfficialReceiptsModalComponent implements OnInit {
  @ViewChild('modal') modal: any;
  @Output() refresh = new EventEmitter<void>();

  isOpen = false;
  isLoading = false;
  errorMessage = '';

  currentEntity: any = null;

  constructor(private officialReceiptsService: OfficialReceiptsService) {}

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

    this.officialReceiptsService.delete(this.currentEntity.id).subscribe({
      next: () => {
        this.isLoading = false;
        this.close();
        this.refresh.emit();
      },
      error: (error: any) => {
        this.isLoading = false;
        this.errorMessage = error?.message || 'Failed to delete receipt';
      }
    });
  }

  private resetForm(): void {
    this.errorMessage = '';
    this.currentEntity = null;
  }
}
