import { Component, ViewChild, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InvoiceLinesService } from '../../../../../shared/services/invoice-lines.service';

@Component({
  selector: 'app-delete-invoice-lines-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './delete-invoice-lines.modal.html',
  styleUrl: './delete-invoice-lines.modal.css'
})
export class DeleteInvoiceLinesModalComponent implements OnInit {
  @ViewChild('modal') modal: any;
  @Output() refresh = new EventEmitter<void>();

  isOpen = false;
  isLoading = false;
  errorMessage = '';

  currentEntity: any = null;

  constructor(private invoiceLinesService: InvoiceLinesService) {}

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

    this.invoiceLinesService.delete(this.currentEntity.id).subscribe({
      next: () => {
        this.isLoading = false;
        this.close();
        this.refresh.emit();
      },
      error: (error: any) => {
        this.isLoading = false;
        this.errorMessage = error?.message || 'Failed to delete invoice line';
      }
    });
  }

  private resetForm(): void {
    this.errorMessage = '';
    this.currentEntity = null;
  }
}
