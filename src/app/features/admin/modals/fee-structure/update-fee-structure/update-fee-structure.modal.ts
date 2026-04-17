import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminDataService, FeeStructure } from '../../../../../shared/services/admin-data.service';

@Component({
  selector: 'app-update-fee-structure-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './update-fee-structure.modal.html',
})
export class UpdateFeeStructureModalComponent {
  isOpen = false;
  isLoading = false;
  errorMessage = '';
  successMessage = '';
  selectedId: number | null = null;

  form: FeeStructure = {
    program_id: 0,
    fee_type: '',
    amount: 0,
    per_unit: false
  };

  feeTypes = ['Tuition', 'Laboratory', 'Library', 'Technology', 'Registration', 'Other'];

  constructor(private adminDataService: AdminDataService) {}

  open(fee: FeeStructure): void {
    this.selectedId = fee.id || null;
    this.form = { ...fee };
    this.isOpen = true;
    this.errorMessage = '';
    this.successMessage = '';
  }

  close(): void {
    this.isOpen = false;
    this.resetForm();
  }

  resetForm(): void {
    this.form = {
      program_id: 0,
      fee_type: '',
      amount: 0,
      per_unit: false
    };
    this.selectedId = null;
    this.errorMessage = '';
    this.successMessage = '';
  }

  submit(): void {
    if (!this.validate()) return;
    if (!this.selectedId) return;

    this.isLoading = true;
    this.errorMessage = '';

    this.adminDataService.updateFeeStructure(this.selectedId, this.form).subscribe({
      next: () => {
        this.isLoading = false;
        this.successMessage = 'Fee structure updated successfully!';
        setTimeout(() => {
          this.close();
          window.location.reload();
        }, 1500);
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = error.error?.message || 'Failed to update fee structure';
        console.error('Error:', error);
      }
    });
  }

  validate(): boolean {
    if (!this.form.program_id) {
      this.errorMessage = 'Program is required';
      return false;
    }
    if (!this.form.fee_type) {
      this.errorMessage = 'Fee type is required';
      return false;
    }
    if (this.form.amount <= 0) {
      this.errorMessage = 'Amount must be greater than 0';
      return false;
    }
    return true;
  }
}
