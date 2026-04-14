import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';
import {
  Billing as BillingModel,
  BillingPayload,
  BillingStatus
} from '../../../models/billing.model';
import { BillingService } from '../../../services/billing.service';

@Component({
  selector: 'app-billing',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './billing.html',
  styleUrl: './billing.css'
})
export class Billing implements OnInit {
  private readonly billingService = inject(BillingService);
  private readonly cdr = inject(ChangeDetectorRef);

  billings: BillingModel[] = [];
  isLoading = false;
  isSubmitting = false;
  showAddForm = false;
  errorMessage = '';
  successMessage = '';

  form: BillingPayload = {
    student_id: '',
    fee_id: '',
    total_amount: 0,
    status: 'unpaid',
    billing_date: '',
    due_date: ''
  };

  ngOnInit(): void {
    this.loadBillings();
  }

  loadBillings(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.billingService.getBillings().pipe(
      finalize(() => {
        this.isLoading = false;
        this.cdr.detectChanges();
      })
    ).subscribe({
      next: (billings: BillingModel[]) => {
        console.log('BILLING FROM API', billings);
        this.billings = billings;
        this.cdr.detectChanges();
      },
      error: (error: Error) => {
        console.error('BILLING API ERROR', error);
        this.errorMessage = error.message;
        this.cdr.detectChanges();
      }
    });
  }

  toggleAddForm(): void {
    this.showAddForm = !this.showAddForm;
    this.errorMessage = '';
    this.successMessage = '';
  }

  submitBilling(): void {
    if (!this.form.student_id || !this.form.fee_id || Number(this.form.total_amount) <= 0 || !this.form.billing_date || !this.form.due_date) {
      this.errorMessage = 'Please complete all required billing fields.';
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';
    this.successMessage = '';

    const payload: BillingPayload = {
      ...this.form,
      total_amount: Number(this.form.total_amount)
    };

    this.billingService.createBilling(payload).pipe(
      finalize(() => {
        this.isSubmitting = false;
        this.cdr.detectChanges();
      })
    ).subscribe({
      next: () => {
        this.successMessage = 'Billing record added successfully.';
        this.form = {
          student_id: '',
          fee_id: '',
          total_amount: 0,
          status: 'unpaid',
          billing_date: '',
          due_date: ''
        };
        this.showAddForm = false;
        this.loadBillings();
      },
      error: (error: Error) => {
        this.errorMessage = error.message;
      }
    });
  }

  get totalAmount(): number {
    return this.billings.reduce((sum, row) => sum + Number(row.total_amount || 0), 0);
  }

  get paidCount(): number {
    return this.billings.filter((row) => (row.status || '').toLowerCase() === 'paid').length;
  }

  statusClass(status: BillingStatus): string {
    const normalized = (status || '').toLowerCase();
    if (normalized === 'paid') {
      return 'bg-emerald-100 text-emerald-700';
    }
    if (normalized === 'partial') {
      return 'bg-amber-100 text-amber-700';
    }
    return 'bg-rose-100 text-rose-700';
  }

  trackByBillingId(_: number, item: BillingModel): string {
    return item.id;
  }
}
