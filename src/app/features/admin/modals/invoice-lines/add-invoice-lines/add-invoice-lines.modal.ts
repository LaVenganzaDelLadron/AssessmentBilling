import { CommonModule } from '@angular/common';
import { Component, DestroyRef, EventEmitter, Output, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import {
  CreateInvoiceLinePayload,
  InvoiceLineType
} from '../../../models/invoice-line.model';
import { Invoice } from '../../../models/invoice.model';
import { Subject } from '../../../models/subject.model';
import { InvoiceLinesService } from '../../../services/invoice-lines.service';
import { InvoicesService } from '../../../services/invoices.service';
import { SubjectsService } from '../../../services/subjects.service';

interface InvoiceOption {
  id: number;
  invoice_number: string;
}

interface SubjectOption {
  id: number;
  code: string;
  name: string;
  units: number;
}

@Component({
  selector: 'app-add-invoice-lines-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './add-invoice-lines.modal.html'
})
export class AddInvoiceLinesModalComponent {
  private readonly destroyRef = inject(DestroyRef);

  @Output() refresh = new EventEmitter<void>();

  isOpen = false;
  isLoading = false;
  isReferenceLoading = false;
  referenceLoadFailed = false;
  errorMessage = '';
  successMessage = '';

  form: CreateInvoiceLinePayload = this.createEmptyForm();
  invoices: InvoiceOption[] = [];
  subjects: SubjectOption[] = [];
  readonly lineTypes: InvoiceLineType[] = [
    'tuition',
    'lab_fee',
    'misc_fee',
    'discount',
    'other'
  ];

  constructor(
    private invoiceLinesService: InvoiceLinesService,
    private invoicesService: InvoicesService,
    private subjectsService: SubjectsService
  ) {}

  open(): void {
    this.isOpen = true;
    this.resetForm();
    this.loadReferenceData();
  }

  close(): void {
    this.isOpen = false;
    this.resetForm();
  }

  get computedAmount(): number {
    return this.calculateAmount(this.form.quantity, this.form.unit_price);
  }

  getLineTypeLabel(type: InvoiceLineType): string {
    return type
      .split('_')
      .map(part => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ');
  }

  getSubjectLabel(subject: SubjectOption): string {
    return `${subject.code} - ${subject.name} (${subject.units.toFixed(2)} units)`;
  }

  isAutoUnitsEnabled(): boolean {
    return this.form.line_type === 'tuition' && this.normalizeOptionalNumber(this.form.subject_id) !== null;
  }

  onLineTypeChange(): void {
    if (this.form.line_type !== 'tuition') {
      this.form.subject_id = null;
      if (Number(this.form.quantity) < 0.01) {
        this.form.quantity = 1;
      }
    }
    this.applyAutoQuantityFromSubject();
  }

  onSubjectChange(): void {
    this.applyAutoQuantityFromSubject();
  }

  validate(): boolean {
    if (!this.form.invoice_id) {
      this.errorMessage = 'Invoice is required';
      return false;
    }
    if (!this.form.line_type) {
      this.errorMessage = 'Line type is required';
      return false;
    }
    if (!this.form.description.trim()) {
      this.errorMessage = 'Description is required';
      return false;
    }
    if (this.form.description.trim().length > 255) {
      this.errorMessage = 'Description may not be greater than 255 characters';
      return false;
    }
    if (Number(this.form.quantity) < 0.01) {
      this.errorMessage = 'Quantity must be at least 0.01';
      return false;
    }
    if (Number(this.form.unit_price) < 0) {
      this.errorMessage = 'Unit price must be 0 or more';
      return false;
    }
    const normalizedSubjectId = this.normalizeOptionalNumber(this.form.subject_id);
    if (this.form.line_type === 'tuition' && normalizedSubjectId === null) {
      this.errorMessage = 'Subject is required for tuition line type';
      return false;
    }
    if (normalizedSubjectId !== null && normalizedSubjectId <= 0) {
      this.errorMessage = 'Subject ID must be a valid number';
      return false;
    }

    return true;
  }

  submit(): void {
    if (!this.validate()) return;

    this.isLoading = true;
    this.errorMessage = '';

    const payload = this.buildPayload();

    this.invoiceLinesService.create(payload).subscribe({
      next: () => {
        this.isLoading = false;
        this.close();
        this.refresh.emit();
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = this.getErrorMessage(error) || 'Failed to create invoice line';
        console.error('Error:', error);
      }
    });
  }

  private resetForm(): void {
    this.form = this.createEmptyForm();
    this.referenceLoadFailed = false;
    this.errorMessage = '';
    this.successMessage = '';
  }

  private loadReferenceData(): void {
    this.isReferenceLoading = true;
    this.referenceLoadFailed = false;

    forkJoin({
      invoices: this.invoicesService.list().pipe(catchError(() => of([]))),
      subjects: this.subjectsService.list().pipe(catchError(() => of([])))
    })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: ({ invoices, subjects }) => {
          this.invoices = this.extractListData<Invoice>(invoices)
            .map((invoice) => ({
              id: Number(invoice.id),
              invoice_number: String(invoice.invoice_number ?? `#${invoice.id}`)
            }))
            .filter((invoice) => Number.isFinite(invoice.id))
            .sort((left, right) => right.id - left.id);

          this.subjects = this.extractListData<Subject>(subjects)
            .map((subject) => ({
              id: Number(subject.id),
              code: String(subject.subject_code ?? subject.code ?? `SUB-${subject.id}`),
              name: String(subject.name ?? `Subject #${subject.id}`),
              units: this.toNumber(subject.units, 1)
            }))
            .filter((subject) => Number.isFinite(subject.id))
            .sort((left, right) => left.name.localeCompare(right.name));

          this.referenceLoadFailed = this.invoices.length === 0;
          this.applyInvoiceDefault();
          this.applyAutoQuantityFromSubject();
          this.isReferenceLoading = false;
        },
        error: () => {
          this.referenceLoadFailed = true;
          this.isReferenceLoading = false;
        }
      });
  }

  private createEmptyForm(): CreateInvoiceLinePayload {
    return {
      invoice_id: 0,
      line_type: 'tuition',
      subject_id: null,
      description: '',
      quantity: 1,
      unit_price: 0,
      amount: 0
    };
  }

  private buildPayload(): CreateInvoiceLinePayload {
    return {
      invoice_id: Number(this.form.invoice_id),
      line_type: this.form.line_type,
      subject_id: this.normalizeOptionalNumber(this.form.subject_id),
      description: this.form.description.trim(),
      quantity: Number(this.form.quantity),
      unit_price: Number(this.form.unit_price),
      amount: this.computedAmount
    };
  }

  private applyInvoiceDefault(): void {
    if (this.form.invoice_id > 0) {
      return;
    }

    if (this.invoices.length > 0) {
      this.form.invoice_id = this.invoices[0].id;
    }
  }

  private applyAutoQuantityFromSubject(): void {
    if (!this.isAutoUnitsEnabled()) {
      return;
    }

    const subjectId = this.normalizeOptionalNumber(this.form.subject_id);
    const selectedSubject = this.subjects.find((subject) => subject.id === subjectId);

    if (!selectedSubject) {
      return;
    }

    this.form.quantity = selectedSubject.units;

    if (!this.form.description.trim()) {
      this.form.description = selectedSubject.name;
    }
  }

  private extractListData<T>(response: unknown): T[] {
    if (Array.isArray(response)) {
      return response as T[];
    }

    const data = (response as { data?: unknown } | null)?.data;
    return Array.isArray(data) ? (data as T[]) : [];
  }

  private calculateAmount(quantity: number | string | null, unitPrice: number | string | null): number {
    const numericQuantity = Number(quantity);
    const numericUnitPrice = Number(unitPrice);

    if (Number.isNaN(numericQuantity) || Number.isNaN(numericUnitPrice)) {
      return 0;
    }

    return Number((numericQuantity * numericUnitPrice).toFixed(2));
  }

  private normalizeOptionalNumber(value: unknown): number | null {
    if (value === null || value === undefined || String(value).trim() === '') {
      return null;
    }

    return Number(value);
  }

  private toNumber(value: unknown, fallback: number = 0): number {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
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
