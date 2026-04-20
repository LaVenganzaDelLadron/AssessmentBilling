import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/assessment/environment';

export interface OfficialReceipt {
  id?: number;
  payment_id: number;
  receipt_number: string;
  amount: number;
  issued_date: string;
  issued_by: number;
  created_at?: string;
  updated_at?: string;
}

@Injectable({
  providedIn: 'root'
})
export class OfficialReceiptsService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  list(): Observable<OfficialReceipt[]> {
    return this.http.get<OfficialReceipt[]>(`${this.apiUrl}/admin/official-receipts`);
  }

  get(id: number): Observable<OfficialReceipt> {
    return this.http.get<OfficialReceipt>(`${this.apiUrl}/admin/official-receipts/${id}`);
  }

  create(data: OfficialReceipt): Observable<OfficialReceipt> {
    return this.http.post<OfficialReceipt>(`${this.apiUrl}/admin/official-receipts`, data);
  }

  update(id: number, data: OfficialReceipt): Observable<OfficialReceipt> {
    return this.http.put<OfficialReceipt>(`${this.apiUrl}/admin/official-receipts/${id}`, data);
  }

  delete(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/admin/official-receipts/${id}`);
  }
}
