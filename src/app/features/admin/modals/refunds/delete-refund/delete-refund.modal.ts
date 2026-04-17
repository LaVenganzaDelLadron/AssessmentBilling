import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminDataService, Refund } from '../../../../../shared/services/admin-data.service';

@Component({
  selector: 'app-delete-refund-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './delete-refund.modal.html',
})
export class DeleteRefundModalComponent {
  isOpen = false;
  isLoading = false;
  errorMessage = '';
  successMessage = '';
  selectedRefund: Refund | null = null;

  constructor(private adminDataService: AdminDataService) {}

  open(refund: Refund): void {
    this.selectedRefund = refund;
    this.isOpen = true;
    this.errorMessage = '';
    this.successMessage = '';
  }

  close(): void {
    this.isOpen = false;
    this.selectedRefund = null;
    this.errorMessage = '';
    this.successMessage = '';
  }

  confirm(): void {
    if (!this.selectedRefund?.id) return;

    this.isLoading = true;
    this.errorMessage = '';

    this.adminDataService.deleteRefund(this.selectedRefund.id).subscribe({
      next: () => {
        this.isLoading = false;
        this.successMessage = 'Refund deleted successfully!';
        setTimeout(() => {
          this.close();
          window.location.reload();
        }, 1500);
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = error.error?.message || 'Failed to delete refund';
        console.error('Error:', error);
      }
    });
  }
}
