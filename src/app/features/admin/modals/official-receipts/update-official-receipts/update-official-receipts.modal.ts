import { Component, ViewChild, Output, EventEmitter, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { OfficialReceiptsService, OfficialReceipt } from '../../../../../shared/services/official-receipts.service';

@Component({
  selector: 'app-update-official-receipts-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './update-official-receipts.modal.html',
  styleUrl: './update-official-receipts.modal.css'
})
export class UpdateOfficialReceiptsModalComponent implements OnInit {
  @ViewChild('modal') modal: any;
  @Output() refresh = new EventEmitter<void>();

  isOpen = false;
  isLoading = false;
  errorMessage = '';

  currentEntity: any = null;

  payment_id: number | null = null;
  receipt_number = '';
  amount: number | null = null;
  issued_date = '';
  issued_by: number | null = null;

  constructor(private officialReceiptsService: OfficialReceiptsService) {}

  ngOnInit(): void {}

  open(entity: any): void {
    this.currentEntity = entity;
    this.payment_id = entity.payment_id;
    this.receipt_number = entity.receipt_number;
    this.amount = entity.amount;
    this.issued_date = entity.issued_date;
    this.issued_by = entity.issued_by;
    this.isOpen = true;
  }

  close(): void {
    this.isOpen = false;
    this.resetForm();
  }

  validate(): boolean {
    if (
      !this.payment_id ||
      !this.receipt_number ||
      !this.amount ||
      !this.issued_date ||
      !this.issued_by
    ) {
      this.errorMessage = 'All fields are required';
      return false;
    }
    return true;
  }

  submit(): void {
    if (!this.validate()) return;

    this.isLoading = true;
    this.errorMessage = '';

    const data: OfficialReceipt = {
      payment_id: this.payment_id || 0,
      receipt_number: this.receipt_number,
      amount: this.amount || 0,
      issued_date: this.issued_date,
      issued_by: this.issued_by || 0
    };

    this.officialReceiptsService.update(this.currentEntity.id, data).subscribe({
      next: () => {
        this.isLoading = false;
        this.close();
        this.refresh.emit();
      },
      error: (error: any) => {
        this.isLoading = false;
        this.errorMessage = error?.message || 'Failed to update receipt';
      }
    });
  }

  private resetForm(): void {
    this.payment_id = null;
    this.receipt_number = '';
    this.amount = null;
    this.issued_date = '';
    this.errorMessage = '';
    this.currentEntity = null;
  }
}
