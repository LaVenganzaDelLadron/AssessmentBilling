import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuditLog } from '../../models/audit-log.model';
import { AuditLogsService } from '../../services/audit-logs.service';

@Component({
  selector: 'app-audit-logs',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './audit-logs.html',
  styleUrl: './audit-logs.css',
})
export class AuditLogs implements OnInit {
  logs: AuditLog[] = [];
  // isLoading removed
  errorMessage = '';
  searchQuery = '';
  actionFilter = '';

  constructor(private auditService: AuditLogsService) {}

  ngOnInit() {
    const cached = this.auditService.getCachedLogs?.();
    if (cached && cached.length > 0) {
      this.logs = cached;
    } else {
      this.loadLogs();
    }
  }

  loadLogs() {
    this.errorMessage = '';
    this.auditService.list().subscribe({
      next: (response: any) => {
        let mapped: AuditLog[] = [];
        let data = Array.isArray(response) ? response : response.data ?? [];
        if (Array.isArray(data)) {
          mapped = data.map((item: any) => ({
            id: item.id ?? item.audit_log_id ?? null,
            user_id: item.user_id ?? null,
            action: item.action ?? '',
            entity_type: item.entity_type ?? '',
            entity_id: item.entity_id ?? '',
            ip_address: item.ip_address ?? null,
            created_at: item.created_at ?? null,
            updated_at: item.updated_at ?? null
          }));
        }
        this.logs = mapped;
        this.auditService.setCachedLogs?.(mapped);
      },
      error: (error) => {
        if (error?.status === 404) {
          this.logs = [];
          return;
        }
        this.errorMessage = this.getErrorMessage?.(error) || 'Failed to load audit logs';
      }
    });
  }

  getFilteredLogs(): AuditLog[] {
    let filtered = this.logs;

    if (this.searchQuery) {
      const q = this.searchQuery.toLowerCase();
      filtered = filtered.filter(log => this.matchesSearch(log, q));
    }

    if (this.actionFilter) {
      filtered = filtered.filter(log => this.normalizeAction(log.action) === this.actionFilter);
    }

    return filtered;
  }

  getActionBadge(action: string): string {
    const base = 'px-3 py-1 rounded-full text-xs font-bold';

    switch(this.normalizeAction(action)) {
      case 'create': return `${base} bg-green-100 text-green-800`;
      case 'update': return `${base} bg-blue-100 text-blue-800`;
      case 'delete': return `${base} bg-red-100 text-red-800`;
      default: return `${base} bg-slate-100 text-slate-800`;
    }
  }

  getActionIconClasses(action: string): string {
    switch (this.normalizeAction(action)) {
      case 'create':
        return 'bg-emerald-50 text-emerald-600';
      case 'update':
        return 'bg-amber-50 text-amber-600';
      case 'delete':
        return 'bg-rose-50 text-rose-600';
      default:
        return 'bg-slate-100 text-slate-600';
    }
  }

  getActionOptions(): string[] {
    const actions = new Set(
      this.logs
        .map(log => this.normalizeAction(log.action))
        .filter(action => action.length > 0)
    );

    return ['all', ...Array.from(actions)];
  }

  setActionFilter(action: string): void {
    this.actionFilter = action === 'all' ? '' : action;
  }

  isSelectedAction(action: string): boolean {
    return action === 'all' ? !this.actionFilter : this.actionFilter === action;
  }

  getActionButtonClasses(action: string): string {
    const base =
      'px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest border transition-all';

    if (this.isSelectedAction(action)) {
      return `${base} bg-indigo-50 text-indigo-600 border-indigo-100`;
    }

    return `${base} bg-white text-slate-400 border-slate-100 hover:border-indigo-200`;
  }

  getUserLabel(log: AuditLog): string {
    return log.user_id ? `User #${log.user_id}` : 'System';
  }

  getUserInitials(log: AuditLog): string {
    return log.user_id ? `U${String(log.user_id).slice(-1)}` : 'SY';
  }

  getEntityLabel(log: AuditLog): string {
    return `${log.entity_type} (#${log.entity_id})`;
  }

  getActionDisplay(action: string): string {
    const normalized = this.normalizeAction(action);
    return normalized ? normalized.toUpperCase() : 'EVENT';
  }

  trackByLogId(_: number, log: AuditLog): number {
    return log.id;
  }

  private matchesSearch(log: AuditLog, query: string): boolean {
    return [
      String(log.id),
      this.getUserLabel(log),
      log.action,
      log.entity_type,
      log.entity_id,
      log.ip_address ?? '',
      log.created_at ?? ''
    ]
      .join(' ')
      .toLowerCase()
      .includes(query);
  }

  private normalizeAction(action: string): string {
    return action.trim().toLowerCase();
  }

  private getErrorMessage(error: unknown): string | null {
    const apiError = error as {
      error?: {
        message?: string;
        errors?: Record<string, string[]>;
      };
    };

    const validationErrors = apiError?.error?.errors;

    if (validationErrors) {
      for (const messages of Object.values(validationErrors)) {
        if (Array.isArray(messages) && typeof messages[0] === 'string') {
          return messages[0];
        }
      }
    }

    return apiError?.error?.message ?? null;
  }
}
