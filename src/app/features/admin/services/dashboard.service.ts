import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, of } from 'rxjs';
import { AdminEndpointService } from './admin-resource.service';
import { DashboardStats } from '../models/dashboard.model';

@Injectable({ providedIn: 'root' })
export class DashboardService extends AdminEndpointService {
  constructor(http: HttpClient) {
    super('dashboard');
  }

  getStats(): Observable<DashboardStats> {
    return this.http.get<DashboardStats>(
      `${this['adminUrl'] || ''}/dashboard`
    ).pipe(
      catchError(error => {
        console.error('Failed to load dashboard stats', error);
        return of(this.getDefaultStats());
      })
    );
  }

  private getDefaultStats(): DashboardStats {
    return {
      totalRevenue: 0,
      pendingPayments: 0,
      overdueAmount: 0,
      paidThisMonth: 0,
      totalStudents: 0,
      activeStudents: 0,
      newStudents: 0,
      assessments: 0,
      upcomingAssessments: 0,
      pendingAssessments: 0,
      invoices: 0,
      paidInvoices: 0,
      pendingInvoices: 0,
    };
  }
}
