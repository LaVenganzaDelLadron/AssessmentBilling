import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/assessment/environment';

export interface PaymentMethod {
  id?: number;
  method_name: string;
  description?: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

@Injectable({
  providedIn: 'root'
})
export class PaymentMethodsService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  list(): Observable<PaymentMethod[]> {
    return this.http.get<PaymentMethod[]>(`${this.apiUrl}/admin/payment-methods`);
  }

  get(id: number): Observable<PaymentMethod> {
    return this.http.get<PaymentMethod>(`${this.apiUrl}/admin/payment-methods/${id}`);
  }

  create(data: PaymentMethod): Observable<PaymentMethod> {
    return this.http.post<PaymentMethod>(`${this.apiUrl}/admin/payment-methods`, data);
  }

  update(id: number, data: PaymentMethod): Observable<PaymentMethod> {
    return this.http.put<PaymentMethod>(`${this.apiUrl}/admin/payment-methods/${id}`, data);
  }

  delete(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/admin/payment-methods/${id}`);
  }
}
