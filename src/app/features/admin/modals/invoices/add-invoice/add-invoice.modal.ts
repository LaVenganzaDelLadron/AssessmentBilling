import { Component, DestroyRef, EventEmitter, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  CreateInvoicePayload,
  Invoice,
  InvoiceStatus
} from '../../../models/invoice.model';
import { InvoicesService } from '../../../services/invoices.service';
import { AssessmentsService } from '../../../services/assessments.service';
import { Assessment as AssessmentModel } from '../../../models/assessment.model';

@Component({
  selector: 'app-add-invoice-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './add-invoice.modal.html',
})
export class AddInvoiceModalComponent {
  private readonly destroyRef = inject(DestroyRef);

  @Output() refresh = new EventEmitter<void>();

  isOpen = false;
  isLoading = false;
  isLoadingAssessments = false;
  errorMessage = '';
  successMessage = '';

  form: CreateInvoicePayload = this.createEmptyForm();
  assessmentOptions: AssessmentModel[] = [];

  readonly statuses: InvoiceStatus[] = ['unpaid', 'partial', 'paid', 'overdue'];

  constructor(
    private invoicesService: InvoicesService,
    private assessmentsService: AssessmentsService
  ) {}

  open(): void {
    this.isOpen = true;
    this.resetForm();
    this.loadAssessments();
    this.generateInvoiceNumber();
  }

  close(): void {
    this.isOpen = false;
    this.resetForm();
  }

  resetForm(): void {
    this.form = this.createEmptyForm();
    this.errorMessage = '';
    this.successMessage = '';
  }

  setBalanceToTotalAmount(): void {
    this.form.balance = Number(this.form.total_amount);
  }

  getAssessmentLabel(assessment: AssessmentModel): string {
    return assessment.student_name?.trim() || `Student #${assessment.student_id}`;
  }

  onAssessmentChange(): void {
    const selectedAssessment = this.getSelectedAssessment();
    this.form.student_id = selectedAssessment?.student_id ?? 0;
  }

  submit(): void {
    if (!this.validate()) return;

    this.isLoading = true;
    this.errorMessage = '';

    this.invoicesService.create(this.buildPayload()).subscribe({
      next: () => {
        this.isLoading = false;
        this.refresh.emit();
        this.close();
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = this.getErrorMessage(error) || 'Failed to create invoice';
        console.error('Error:', error);
      }
    });
  }

  validate(): boolean {
    if (!this.form.assessment_id) {
      this.errorMessage = 'Assessment is required';
      return false;
    }
    if (!this.form.invoice_number?.trim()) {
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

  private createEmptyForm(): CreateInvoicePayload {
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

  private buildPayload(): CreateInvoicePayload {
    const selectedAssessment = this.getSelectedAssessment();

    return {
      student_id: Number(selectedAssessment?.student_id ?? this.form.student_id),
      assessment_id: Number(this.form.assessment_id),
      invoice_number: this.form.invoice_number.trim(),
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
                .filter((assessment: AssessmentModel) => !!assessment.id)
                .sort((a: AssessmentModel, b: AssessmentModel) => b.id - a.id)
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

  private generateInvoiceNumber(): void {
    const currentYear = new Date().getFullYear();

    this.invoicesService
      .list()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          const data = Array.isArray(response) ? response : response.data ?? [];
          const invoices = Array.isArray(data) ? (data as Invoice[]) : [];
          const nextSequence = this.getNextSequenceNumber(invoices);
          this.form.invoice_number = `INV-${currentYear}-${String(nextSequence).padStart(4, '0')}`;
        },
        error: () => {
          this.form.invoice_number = `INV-${currentYear}-0001`;
        }
      });
  }

  private getNextSequenceNumber(invoices: Invoice[]): number {
    const maxSequence = invoices.reduce((max, invoice) => {
      const match = String(invoice.invoice_number ?? '').match(/(\d+)(?!.*\d)/);
      if (!match) {
        return max;
      }

      const value = Number(match[1]);
      return Number.isFinite(value) ? Math.max(max, value) : max;
    }, 0);

    return maxSequence + 1;
  }

  private getSelectedAssessment(): AssessmentModel | undefined {
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
