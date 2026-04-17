export interface DashboardStats {
  totalRevenue: number;
  pendingPayments: number;
  overdueAmount: number;
  paidThisMonth: number;

  totalStudents: number;
  activeStudents: number;
  newStudents: number;

  assessments: number;
  upcomingAssessments: number;
  pendingAssessments: number;

  invoices: number;
  paidInvoices: number;
  pendingInvoices: number;
}
