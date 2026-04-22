import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { environment } from '../../../../../environments/assessment/environment';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard implements OnInit {
  private readonly http = inject(HttpClient);
  private readonly teacherApiRoot = `${environment.apiUrl}/teacher`;

  isLoading = false;
  errorMessage = '';
  subjects: any[] = [];
  enrollments: any[] = [];
  assessments: any[] = [];
  breakdowns: any[] = [];

  ngOnInit(): void {
    this.loadDashboard();
  }

  async loadDashboard(): Promise<void> {
    this.isLoading = true;
    this.errorMessage = '';

    try {
      const [subjects, enrollments, assessments, breakdowns] = await Promise.all([
        this.requestList(`${this.teacherApiRoot}/subjects`),
        this.requestList(`${this.teacherApiRoot}/enrollments`),
        this.requestList(`${this.teacherApiRoot}/assessments`),
        this.requestList(`${this.teacherApiRoot}/assessment-breakdown`)
      ]);

      this.subjects = subjects;
      this.enrollments = enrollments;
      this.assessments = assessments;
      this.breakdowns = breakdowns;
    } catch (error: any) {
      this.errorMessage = error?.error?.message || 'Failed to load teacher dashboard.';
    } finally {
      this.isLoading = false;
    }
  }

  get finalizedCount(): number {
    return this.assessments.filter((item) => item.status === 'finalized').length;
  }

  get recentAssessments(): any[] {
    return this.assessments.slice(0, 3);
  }

  private async requestList(url: string): Promise<any[]> {
    try {
      const response = await this.http.get<any>(url).toPromise();
      const data = Array.isArray(response) ? response : response?.data ?? [];
      return Array.isArray(data) ? data : [];
    } catch (error: any) {
      if (error?.status === 404) {
        return [];
      }
      throw error;
    }
  }
}
