import { Component, OnInit, ViewChild, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { catchError, forkJoin, of } from 'rxjs';
import { AdminNumericValue } from '../../models/admin-api.model';
import { Invoice } from '../../models/invoice.model';
import { Student } from '../../models/student.model';
import { InvoicesService } from '../../services/invoices.service';
import { StudentsService } from '../../services/students.service';
import { AddInvoiceModalComponent } from '../../modals/invoices/add-invoice/add-invoice.modal';
import { UpdateInvoiceModalComponent } from '../../modals/invoices/update-invoice/update-invoice.modal';
import { DeleteInvoiceModalComponent } from '../../modals/invoices/delete-invoice/delete-invoice.modal';
import { InvoicesCard } from '../../cards/invoices-card/invoices-card';

@Component({
  selector: 'app-invoices',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    AddInvoiceModalComponent,
    UpdateInvoiceModalComponent,
    DeleteInvoiceModalComponent,
    InvoicesCard
  ],
  templateUrl: './invoices.html',
  styleUrl: './invoices.css',
})
export class Invoices implements OnInit {
  private readonly destroyRef = inject(DestroyRef);

  @ViewChild(AddInvoiceModalComponent) addModal!: AddInvoiceModalComponent;
  @ViewChild(UpdateInvoiceModalComponent) updateModal!: UpdateInvoiceModalComponent;
  @ViewChild(DeleteInvoiceModalComponent) deleteModal!: DeleteInvoiceModalComponent;

  invoices: Invoice[] = [];
  isLoading = false;
  errorMessage = '';
  searchQuery = '';
  statusFilter = '';
  private studentsById = new Map<number, Student>();
  readonly statuses = ['unpaid', 'partial', 'paid', 'overdue'] as const;

  constructor(
    private invoicesService: InvoicesService,
    private studentsService: StudentsService
  ) {}

  ngOnInit() {
    this.loadInvoices();
  }

  loadInvoices() {
    this.errorMessage = '';
    this.isLoading = true;
    forkJoin({
      invoices: this.invoicesService.list(),
      students: this.studentsService.list({ page: 1, per_page: 100 }).pipe(catchError(() => of([])))
    }).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (response) => {
        console.log('[Invoices] API response:', response);
        const invoiceData = this.extractListData<Invoice>(response.invoices);
        const students = this.extractListData<Student>(response.students);

        this.studentsById = new Map(
          students
            .filter((student) => Number.isFinite(Number(student?.id)))
            .map((student) => [Number(student.id), student])
        );

        if (Array.isArray(invoiceData)) {
          console.log('[Invoices] First invoice:', invoiceData[0]);
          // Defensive: filter out any items missing required fields
          this.invoices = invoiceData
            .filter(inv =>
              inv && typeof inv.invoice_number === 'string' && inv.student_id !== undefined && inv.assessment_id !== undefined
            )
            .map((invoice) => this.withStudentName(invoice));
        } else {
          this.invoices = [];
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('[Invoices] API error:', error);
        if (error?.status === 404) {
          this.invoices = [];
          this.isLoading = false;
          return;
        }
        this.errorMessage = this.getErrorMessage(error) || 'Failed to load invoices';
        this.isLoading = false;
      }
    });
  }

  openAddModal() {
    this.addModal.open();
  }

  openUpdateModal(invoice: Invoice) {
    this.updateModal.open(invoice);
  }

  openDeleteModal(invoice: Invoice) {
    this.deleteModal.open(invoice);
  }

  trackByInvoiceId(index: number, invoice: Invoice): string | number {
    return invoice && invoice.id !== undefined ? invoice.id : index;
  }

  getFilteredInvoices(): Invoice[] {
    if (!this.searchQuery.trim()) {
      return this.invoices;
    }

    const query = this.searchQuery.toLowerCase();

    return this.invoices.filter((invoice) =>
      [
        invoice.invoice_number,
        invoice.student_name ?? '',
        invoice.student_id,
        invoice.assessment_id,
        invoice.status,
        invoice.total_amount,
        invoice.balance
      ]
        .join(' ')
        .toLowerCase()
        .includes(query)
    );
  }

  getStatusColor(status: string) {
    switch(status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'partial': return 'bg-amber-100 text-amber-800';
      case 'unpaid': return 'bg-yellow-100 text-yellow-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
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

  private extractListData<T>(response: unknown): T[] {
    if (Array.isArray(response)) {
      return response as T[];
    }

    const data = (response as { data?: unknown } | null)?.data;
    return Array.isArray(data) ? (data as T[]) : [];
  }

  private withStudentName(invoice: Invoice): Invoice {
    const student = this.studentsById.get(Number(invoice.student_id));
    const studentName = student
      ? [student.first_name, student.middle_name, student.last_name].filter(Boolean).join(' ').trim()
      : null;

    return {
      ...invoice,
      student_name: studentName || invoice.student_name || null
    };
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
