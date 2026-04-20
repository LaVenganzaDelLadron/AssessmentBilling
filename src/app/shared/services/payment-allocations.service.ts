import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/assessment/environment';

export interface PaymentAllocation {
  id?: number;
  payment_id: number;
  invoice_id: number;
  allocated_amount: number;
  created_at?: string;
  updated_at?: string;
}

@Injectable({
  providedIn: 'root'
})
export class PaymentAllocationsService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  list(): Observable<PaymentAllocation[]> {
    return this.http.get<PaymentAllocation[]>(`${this.apiUrl}/admin/payment-allocations`);
  }

  get(id: number): Observable<PaymentAllocation> {
    return this.http.get<PaymentAllocation>(`${this.apiUrl}/admin/payment-allocations/${id}`);
  }

  create(data: PaymentAllocation): Observable<PaymentAllocation> {
    return this.http.post<PaymentAllocation>(`${this.apiUrl}/admin/payment-allocations`, data);
  }

  update(id: number, data: PaymentAllocation): Observable<PaymentAllocation> {
    return this.http.put<PaymentAllocation>(`${this.apiUrl}/admin/payment-allocations/${id}`, data);
  }

  delete(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/admin/payment-allocations/${id}`);
  }
}
