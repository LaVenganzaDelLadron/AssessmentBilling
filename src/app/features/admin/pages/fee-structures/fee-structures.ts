import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminNumericValue } from '../../models/admin-api.model';
import { FeeStructure } from '../../models/fee-structure.model';
import { FeeStructuresService } from '../../services/fee-structures.service';
import { AddFeeStructureModalComponent } from '../../modals/fee-structure/add-fee-structure/add-fee-structure.modal';
import { UpdateFeeStructureModalComponent } from '../../modals/fee-structure/update-fee-structure/update-fee-structure.modal';
import { DeleteFeeStructureModalComponent } from '../../modals/fee-structure/delete-fee-structure/delete-fee-structure.modal';

@Component({
  selector: 'app-fee-structures',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    AddFeeStructureModalComponent,
    UpdateFeeStructureModalComponent,
    DeleteFeeStructureModalComponent
  ],
  templateUrl: './fee-structures.html',
  styleUrl: './fee-structures.css',
})
export class FeeStructures implements OnInit {
  @ViewChild(AddFeeStructureModalComponent) addModal!: AddFeeStructureModalComponent;
  @ViewChild(UpdateFeeStructureModalComponent) updateModal!: UpdateFeeStructureModalComponent;
  @ViewChild(DeleteFeeStructureModalComponent) deleteModal!: DeleteFeeStructureModalComponent;

  fees: FeeStructure[] = [];
  isLoading = false;
  errorMessage = '';
  searchQuery = '';

  constructor(private feeStructuresService: FeeStructuresService) {}

  ngOnInit() {
    this.loadFees();
  }

  loadFees() {
    this.isLoading = true;
    this.errorMessage = '';

    this.feeStructuresService.list().subscribe({
      next: (response) => {
        this.fees = Array.isArray(response) ? response : response.data ?? [];
        this.isLoading = false;
      },
      error: (error) => {
        this.isLoading = false;

        if (error?.status === 404) {
          this.fees = [];
          return;
        }

        this.errorMessage = this.getErrorMessage(error) || 'Failed to load fee structures';
        console.error('Error:', error);
      }
    });
  }

  openAddModal() {
    this.addModal.open();
  }

  openUpdateModal(fee: FeeStructure) {
    this.updateModal.open(fee);
  }

  openDeleteModal(fee: FeeStructure) {
    this.deleteModal.open(fee);
  }

  getFilteredFees(): FeeStructure[] {
    if (!this.searchQuery) return this.fees;

    const query = this.searchQuery.toLowerCase();

    return this.fees.filter(fee =>
      fee.fee_type.toLowerCase().includes(query) ||
      fee.program_id.toString().includes(query) ||
      String(fee.amount).toLowerCase().includes(query) ||
      (fee.per_unit ? 'per unit yes true' : 'per unit no false').includes(query)
    );
  }

  formatAmount(value: AdminNumericValue): string {
    const numericValue = Number(value);

    if (Number.isNaN(numericValue)) {
      return String(value);
    }

    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(numericValue);
  }

  private getErrorMessage(error: unknown): string | null {
    const apiError = error as {
      error?: {
        message?: string;
        errors?: Record<string, string[]>;
      };
    };

    const validationErrors = apiError?.error?.errors;

    if (validationErrors) {
      for (const messages of Object.values(validationErrors)) {
        if (Array.isArray(messages) && typeof messages[0] === 'string') {
          return messages[0];
        }
      }
    }

    return apiError?.error?.message ?? null;
  }
}
