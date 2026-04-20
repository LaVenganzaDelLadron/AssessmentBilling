import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminDataService, FeeStructure } from '../../../../shared/services/admin-data.service';
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

  constructor(private adminDataService: AdminDataService) {}

  ngOnInit() {
    this.loadFees();
  }

  loadFees() {
    this.isLoading = true;
    this.adminDataService.getFeeStructures().subscribe({
      next: (data) => {
        this.fees = data;
        this.isLoading = false;
      },
      error: (error: any) => {
        this.errorMessage = 'Failed to load fee structures';
        this.isLoading = false;
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

  getFilteredFees() {
    if (!this.searchQuery) return this.fees;
    const query = this.searchQuery.toLowerCase();
    return this.fees.filter(fee => fee.fee_type.toLowerCase().includes(query));
  }
}
