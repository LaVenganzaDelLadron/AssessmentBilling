import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuditLogsService, AuditLog } from '../../../../shared/services/audit-logs.service';

@Component({
  selector: 'app-audit-logs',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './audit-logs.html',
  styleUrl: './audit-logs.css',
})
export class AuditLogs implements OnInit {
  logs: AuditLog[] = [];
  isLoading = false;
  errorMessage = '';
  searchQuery = '';
  filterType = '';

  constructor(private auditService: AuditLogsService) {}

  ngOnInit() {
    this.loadLogs();
  }

  loadLogs() {
    this.isLoading = true;
    this.auditService.list().subscribe({
      next: (data: any) => {
        this.logs = Array.isArray(data) ? data : data.data || [];
        this.isLoading = false;
      },
      error: (error: any) => {
        this.errorMessage = 'Failed to load audit logs';
        this.isLoading = false;
      }
    });
  }

  getFilteredLogs() {
    let filtered = this.logs;
    if (this.searchQuery) {
      const q = this.searchQuery.toLowerCase();
      filtered = filtered.filter(l => JSON.stringify(l).toLowerCase().includes(q));
    }
    if (this.filterType) {
      filtered = filtered.filter(l => l.action === this.filterType);
    }
    return filtered;
  }

  getActionBadge(action: string) {
    const base = 'px-3 py-1 rounded-full text-xs font-bold';
    switch(action) {
      case 'create': return `${base} bg-green-100 text-green-800`;
      case 'update': return `${base} bg-blue-100 text-blue-800`;
      case 'delete': return `${base} bg-red-100 text-red-800`;
      default: return `${base} bg-slate-100 text-slate-800`;
    }
  }
}
