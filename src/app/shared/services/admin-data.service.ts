import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, asyncScheduler, observeOn } from 'rxjs';
import { environment } from '../../../environments/assessment/environment';

export interface FeeStructure {
  id?: number;
  program_id: number;
  fee_type: string;
  amount: number;
  per_unit: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Enrollment {
  id?: number;
  student_id: number;
  subject_id: number;
  academic_term_id: number;
  status: string;
  created_at?: string;
  updated_at?: string;
}

export interface Invoice {
  id?: number;
  student_id: number;
  assessment_id: number;
  invoice_number: string;
  total_amount: number;
  balance: number;
  due_date: string;
  status: string;
  created_at?: string;
  updated_at?: string;
}

export interface Payment {
  id?: number;
  invoice_id: number;
  amount_paid: number;
  reference_number: string;
  paid_at: string;
  payment_method_id: number;
  created_at?: string;
  updated_at?: string;
}

export interface Refund {
  id?: number;
  payment_id: number;
  amount: number;
  reason: string;
  status: string;
  created_at?: string;
  updated_at?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AdminDataService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  private scheduleResponse<T>(request$: Observable<T>): Observable<T> {
    return request$.pipe(observeOn(asyncScheduler));
  }

  // Fee Structure
  getFeeStructures(): Observable<FeeStructure[]> {
    return this.scheduleResponse(
      this.http.get<FeeStructure[]>(`${this.apiUrl}/admin/fee-structures`)
    );
  }

  createFeeStructure(data: FeeStructure): Observable<FeeStructure> {
    return this.http.post<FeeStructure>(`${this.apiUrl}/admin/fee-structures`, data);
  }

  updateFeeStructure(id: number, data: FeeStructure): Observable<FeeStructure> {
    return this.http.put<FeeStructure>(`${this.apiUrl}/admin/fee-structures/${id}`, data);
  }

  deleteFeeStructure(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/admin/fee-structures/${id}`);
  }

  // Enrollments
  getEnrollments(): Observable<Enrollment[]> {
    return this.scheduleResponse(
      this.http.get<Enrollment[]>(`${this.apiUrl}/admin/enrollments`)
    );
  }

  createEnrollment(data: Enrollment): Observable<Enrollment> {
    return this.http.post<Enrollment>(`${this.apiUrl}/admin/enrollments`, data);
  }

  updateEnrollment(id: number, data: Enrollment): Observable<Enrollment> {
    return this.http.put<Enrollment>(`${this.apiUrl}/admin/enrollments/${id}`, data);
  }

  deleteEnrollment(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/admin/enrollments/${id}`);
  }

  // Invoices
  getInvoices(): Observable<Invoice[]> {
    return this.scheduleResponse(
      this.http.get<Invoice[]>(`${this.apiUrl}/admin/invoices`)
    );
  }

  createInvoice(data: Invoice): Observable<Invoice> {
    return this.http.post<Invoice>(`${this.apiUrl}/admin/invoices`, data);
  }

  updateInvoice(id: number, data: Invoice): Observable<Invoice> {
    return this.http.put<Invoice>(`${this.apiUrl}/admin/invoices/${id}`, data);
  }

  deleteInvoice(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/admin/invoices/${id}`);
  }

  // Payments
  getPayments(): Observable<Payment[]> {
    return this.scheduleResponse(
      this.http.get<Payment[]>(`${this.apiUrl}/admin/payments`)
    );
  }

  createPayment(data: Payment): Observable<Payment> {
    return this.http.post<Payment>(`${this.apiUrl}/admin/payments`, data);
  }

  updatePayment(id: number, data: Payment): Observable<Payment> {
    return this.http.put<Payment>(`${this.apiUrl}/admin/payments/${id}`, data);
  }

  deletePayment(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/admin/payments/${id}`);
  }

  // Refunds
  getRefunds(): Observable<Refund[]> {
    return this.scheduleResponse(
      this.http.get<Refund[]>(`${this.apiUrl}/admin/refunds`)
    );
  }

  createRefund(data: Refund): Observable<Refund> {
    return this.http.post<Refund>(`${this.apiUrl}/admin/refunds`, data);
  }

  updateRefund(id: number, data: Refund): Observable<Refund> {
    return this.http.put<Refund>(`${this.apiUrl}/admin/refunds/${id}`, data);
  }

  deleteRefund(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/admin/refunds/${id}`);
  }
}
