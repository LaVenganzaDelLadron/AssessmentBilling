import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { provideRouter } from '@angular/router';

import { Dashboard } from './dashboard';
import { DashboardService } from '../../services/dashboard.service';

describe('Dashboard', () => {
  let component: Dashboard;
  let fixture: ComponentFixture<Dashboard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Dashboard],
      providers: [
        provideRouter([]),
        {
          provide: DashboardService,
          useValue: {
            getOverview: () => of({
              stats: {
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
                pendingInvoices: 0
              },
              recentInvoices: [],
              revenueTrend: [],
              paymentDistribution: [],
              lastUpdated: '2026-04-21T00:00:00.000Z'
            })
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(Dashboard);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
