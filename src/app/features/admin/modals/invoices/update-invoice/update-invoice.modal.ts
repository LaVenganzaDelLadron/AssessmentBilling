import { Component, DestroyRef, EventEmitter, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  Invoice,
  InvoiceStatus,
  UpdateInvoicePayload
} from '../../../models/invoice.model';
import { InvoicesService } from '../../../services/invoices.service';
import { AssessmentsService } from '../../../services/assessments.service';
import { Assessment } from '../../../models/assessment.model';

@Component({
  selector: 'app-update-invoice-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './update-invoice.modal.html',
})
export class UpdateInvoiceModalComponent {
  private readonly destroyRef = inject(DestroyRef);

  @Output() refresh = new EventEmitter<void>();

  isOpen = false;
  isLoading = false;
  isLoadingAssessments = false;
  errorMessage = '';
  successMessage = '';
  selectedId: number | null = null;

  form: UpdateInvoicePayload = this.createEmptyForm();
  assessmentOptions: Assessment[] = [];

  readonly statuses: InvoiceStatus[] = ['unpaid', 'partial', 'paid', 'overdue'];

  constructor(
    private invoicesService: InvoicesService,
    private assessmentsService: AssessmentsService
  ) {}

  open(invoice: Invoice): void {
    this.selectedId = invoice.id || null;
    this.form = {
      student_id: invoice.student_id,
      assessment_id: invoice.assessment_id,
      invoice_number: invoice.invoice_number,
      total_amount: Number(invoice.total_amount),
      balance: Number(invoice.balance),
      due_date: this.normalizeDateInput(invoice.due_date),
      status: invoice.status
    };
    this.isOpen = true;
    this.errorMessage = '';
    this.successMessage = '';
    this.loadAssessments();
  }

  close(): void {
    this.isOpen = false;
    this.resetForm();
  }

  resetForm(): void {
    this.form = this.createEmptyForm();
    this.selectedId = null;
    this.errorMessage = '';
    this.successMessage = '';
  }

  setBalanceToTotalAmount(): void {
    this.form.balance = Number(this.form.total_amount ?? 0);
  }

  getAssessmentLabel(assessment: Assessment): string {
    return assessment.student_name?.trim() || `Student #${assessment.student_id}`;
  }

  onAssessmentChange(): void {
    const selectedAssessment = this.getSelectedAssessment();
    this.form.student_id = selectedAssessment?.student_id ?? this.form.student_id ?? 0;
  }

  submit(): void {
    if (!this.validate()) return;
    if (!this.selectedId) return;

    this.isLoading = true;
    this.errorMessage = '';

    this.invoicesService.update(this.selectedId, this.buildPayload()).subscribe({
      next: () => {
        this.isLoading = false;
        this.refresh.emit();
        this.close();
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = this.getErrorMessage(error) || 'Failed to update invoice';
        console.error('Error:', error);
      }
    });
  }

  validate(): boolean {
    if (!this.form.assessment_id) {
      this.errorMessage = 'Assessment is required';
      return false;
    }
    if (!this.form.invoice_number) {
      this.errorMessage = 'Invoice number is required';
      return false;
    }
    if (this.form.invoice_number.trim().length > 255) {
      this.errorMessage = 'Invoice number may not be greater than 255 characters';
      return false;
    }
    if (Number(this.form.total_amount) < 0) {
      this.errorMessage = 'Total amount must be at least 0';
      return false;
    }
    if (Number(this.form.balance) < 0) {
      this.errorMessage = 'Balance must be at least 0';
      return false;
    }
    if (!this.form.due_date) {
      this.errorMessage = 'Due date is required';
      return false;
    }
    return true;
  }

  private createEmptyForm(): UpdateInvoicePayload {
    return {
      student_id: 0,
      assessment_id: 0,
      invoice_number: '',
      total_amount: 0,
      balance: 0,
      due_date: '',
      status: 'unpaid'
    };
  }

  private buildPayload(): UpdateInvoicePayload {
    const selectedAssessment = this.getSelectedAssessment();

    return {
      student_id: Number(selectedAssessment?.student_id ?? this.form.student_id),
      assessment_id: Number(this.form.assessment_id),
      invoice_number: this.form.invoice_number?.trim(),
      total_amount: Number(this.form.total_amount),
      balance: Number(this.form.balance),
      due_date: this.form.due_date,
      status: this.form.status
    };
  }

  private loadAssessments(): void {
    const cached = this.assessmentsService.getCachedAssessments();
    if (cached && cached.length > 0) {
      this.assessmentOptions = [...cached].sort((a, b) => b.id - a.id);
      this.onAssessmentChange();
      return;
    }

    this.isLoadingAssessments = true;
    this.assessmentsService
      .list()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response: any) => {
          const data = Array.isArray(response) ? response : response.data ?? [];

          this.assessmentOptions = Array.isArray(data)
            ? data
                .map((item: any) => ({
                  id: item.id ?? item.assessment_id ?? 0,
                  student_id: item.student_id ?? 0,
                  student_name: (
                    item.student_name ??
                    item.student?.name ??
                    [item.student?.first_name, item.student?.last_name].filter(Boolean).join(' ').trim()
                  ) || null,
                  academic_term_id: item.academic_term_id ?? 0,
                  semester: item.semester ?? '',
                  school_year: item.school_year ?? '',
                  total_units: item.total_units ?? 0,
                  tuition_fee: item.tuition_fee ?? 0,
                  misc_fee: item.misc_fee ?? 0,
                  lab_fee: item.lab_fee ?? 0,
                  other_fees: item.other_fees ?? 0,
                  total_amount: item.total_amount ?? 0,
                  discount: item.discount ?? 0,
                  net_amount: item.net_amount ?? 0,
                  status: item.status ?? 'draft',
                  created_at: item.created_at ?? null,
                  updated_at: item.updated_at ?? null
                }))
                .filter((assessment: Assessment) => !!assessment.id)
                .sort((a: Assessment, b: Assessment) => b.id - a.id)
            : [];

          this.assessmentsService.setCachedAssessments(this.assessmentOptions);
          this.onAssessmentChange();
          this.isLoadingAssessments = false;
        },
        error: () => {
          this.assessmentOptions = [];
          this.isLoadingAssessments = false;
        }
      });
  }

  private normalizeDateInput(value: string): string {
    return value ? value.slice(0, 10) : '';
  }

  private getSelectedAssessment(): Assessment | undefined {
    return this.assessmentOptions.find(
      (assessment) => assessment.id === Number(this.form.assessment_id)
    );
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
