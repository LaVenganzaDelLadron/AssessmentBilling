import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminDataService, FeeStructure } from '../../../../../shared/services/admin-data.service';

@Component({
  selector: 'app-delete-fee-structure-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './delete-fee-structure.modal.html',
})
export class DeleteFeeStructureModalComponent {
  isOpen = false;
  isLoading = false;
  errorMessage = '';
  successMessage = '';
  selectedFee: FeeStructure | null = null;

  constructor(private adminDataService: AdminDataService) {}

  open(fee: FeeStructure): void {
    this.selectedFee = fee;
    this.isOpen = true;
    this.errorMessage = '';
    this.successMessage = '';
  }

  close(): void {
    this.isOpen = false;
    this.selectedFee = null;
    this.errorMessage = '';
    this.successMessage = '';
  }

  confirm(): void {
    if (!this.selectedFee?.id) return;

    this.isLoading = true;
    this.errorMessage = '';

    this.adminDataService.deleteFeeStructure(this.selectedFee.id).subscribe({
      next: () => {
        this.isLoading = false;
        this.successMessage = 'Fee structure deleted successfully!';
        setTimeout(() => {
          this.close();
          window.location.reload();
        }, 1500);
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = error.error?.message || 'Failed to delete fee structure';
        console.error('Error:', error);
      }
    });
  }
}
