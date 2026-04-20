import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/assessment/environment';

export interface InvoiceLine {
  id?: number;
  invoice_id: number;
  description: string;
  quantity: number;
  unit_price: number;
  line_total: number;
  created_at?: string;
  updated_at?: string;
}

@Injectable({
  providedIn: 'root'
})
export class InvoiceLinesService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  list(): Observable<InvoiceLine[]> {
    return this.http.get<InvoiceLine[]>(`${this.apiUrl}/admin/invoice-lines`);
  }

  get(id: number): Observable<InvoiceLine> {
    return this.http.get<InvoiceLine>(`${this.apiUrl}/admin/invoice-lines/${id}`);
  }

  create(data: InvoiceLine): Observable<InvoiceLine> {
    return this.http.post<InvoiceLine>(`${this.apiUrl}/admin/invoice-lines`, data);
  }

  update(id: number, data: InvoiceLine): Observable<InvoiceLine> {
    return this.http.put<InvoiceLine>(`${this.apiUrl}/admin/invoice-lines/${id}`, data);
  }

  delete(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/admin/invoice-lines/${id}`);
  }
}
