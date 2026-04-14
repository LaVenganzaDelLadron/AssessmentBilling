import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';
import { Fee, FeePayload } from '../../../models/fees.mode';
import { FeesService } from '../../../services/fees.service';

@Component({
  selector: 'app-fees',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './fees.html',
  styleUrl: './fees.css'
})
export class Fees implements OnInit {
  private readonly feesService = inject(FeesService);
  private readonly cdr = inject(ChangeDetectorRef);

  fees: Fee[] = [];
  isLoading = false;
  isSubmitting = false;
  showAddForm = false;
  errorMessage = '';
  successMessage = '';

  form: FeePayload = {
    name: '',
    amount: 0
  };

  ngOnInit(): void {
    this.loadFees();
  }

  loadFees(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.feesService.getFees().pipe(
      finalize(() => {
        this.isLoading = false;
        this.cdr.detectChanges();
      })
    ).subscribe({
      next: (fees: Fee[]) => {
        console.log('FEES FROM API', fees);
        this.fees = fees;
        this.cdr.detectChanges();
      },
      error: (error: Error) => {
        console.error('FEES API ERROR', error);
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

  submitFee(): void {
    if (!this.form.name || Number(this.form.amount) <= 0) {
      this.errorMessage = 'Please enter a valid fee name and amount.';
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';
    this.successMessage = '';

    const payload: FeePayload = {
      ...this.form,
      amount: Number(this.form.amount)
    };

    this.feesService.createFee(payload).pipe(
      finalize(() => {
        this.isSubmitting = false;
        this.cdr.detectChanges();
      })
    ).subscribe({
      next: () => {
        this.successMessage = 'Fee added successfully.';
        this.form = { name: '', amount: 0 };
        this.showAddForm = false;
        this.loadFees();
      },
      error: (error: Error) => {
        this.errorMessage = error.message;
      }
    });
  }

  get totalAmount(): number {
    return this.fees.reduce((sum, fee) => sum + Number(fee.amount || 0), 0);
  }

  trackByFeeId(_: number, fee: Fee): string {
    return fee.id;
  }
}
