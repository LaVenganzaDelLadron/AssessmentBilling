import { Component, OnInit, ViewChild, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminNumericValue } from '../../models/admin-api.model';
import { FeeStructure } from '../../models/fee-structure.model';
import { FeeStructuresService } from '../../services/fee-structures.service';
import { AddFeeStructureModalComponent } from '../../modals/fee-structure/add-fee-structure/add-fee-structure.modal';
import { UpdateFeeStructureModalComponent } from '../../modals/fee-structure/update-fee-structure/update-fee-structure.modal';
import { DeleteFeeStructureModalComponent } from '../../modals/fee-structure/delete-fee-structure/delete-fee-structure.modal';
import { FeeStructureCard } from '../../cards/fee-structure-card/fee-structure-card';

@Component({
  selector: 'app-fee-structures',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    AddFeeStructureModalComponent,
    UpdateFeeStructureModalComponent,
    DeleteFeeStructureModalComponent,
    FeeStructureCard
  ],
  templateUrl: './fee-structures.html',
  styleUrl: './fee-structures.css',
})
export class FeeStructures implements OnInit {
  private readonly destroyRef = inject(DestroyRef);

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
    this.errorMessage = '';
    this.isLoading = true;
    this.feeStructuresService.list().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (response: any) => {
        let mapped: FeeStructure[] = [];
        let data = Array.isArray(response) ? response : response.data ?? [];
        if (Array.isArray(data)) {
          mapped = data.map((item: any) => ({
            id: item.id ?? item.fee_structure_id ?? null,
            program_id: item.program_id ?? null,
            fee_type: item.fee_type ?? '',
            amount: item.amount ?? 0,
            per_unit: !!item.per_unit,
            created_at: item.created_at ?? null,
            updated_at: item.updated_at ?? null
          }));
        }
        this.fees = mapped;
        this.feeStructuresService.setCachedFees(mapped);
        this.isLoading = false;
      },
      error: (error) => {
        console.error('[FeeStructures] API error:', error);
        if (error?.status === 404) {
          this.fees = [];
          this.isLoading = false;
          return;
        }
        this.errorMessage = this.getErrorMessage(error) || 'Failed to load fee structures';
        this.isLoading = false;
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
