import { Component, OnInit, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuditLog } from '../../models/audit-log.model';
import { AuditLogsService } from '../../services/audit-logs.service';
import { LogCard } from '../../cards/log-card/log-card';

@Component({
  selector: 'app-audit-logs',
  standalone: true,
  imports: [CommonModule, FormsModule, LogCard],
  templateUrl: './audit-logs.html',
  styleUrl: './audit-logs.css',
})
export class AuditLogs implements OnInit {
  private readonly destroyRef = inject(DestroyRef);

  logs: AuditLog[] = [];
  isLoading = false;
  errorMessage = '';
  searchQuery = '';
  actionFilter = '';

  constructor(private auditService: AuditLogsService) {}

  ngOnInit() {
    this.loadLogs();
  }

  loadLogs() {
    this.errorMessage = '';
    this.isLoading = true;
    this.auditService.list().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
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
        this.isLoading = false;
      },
      error: (error) => {
        if (error?.status === 404) {
          this.logs = [];
          this.isLoading = false;
          return;
        }
        this.errorMessage = this.getErrorMessage?.(error) || 'Failed to load audit logs';
        this.isLoading = false;
      }
    });
  }

  refreshLogs(): void {
    this.loadLogs();
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

  getTotalLogs(): number {
    return this.logs.length;
  }

  getVisibleLogCount(): number {
    return this.getFilteredLogs().length;
  }

  getUniqueEntityCount(): number {
    return new Set(
      this.logs
        .map((log) => `${log.entity_type}:${log.entity_id}`)
        .filter((entity) => entity !== ':')
    ).size;
  }

  getRecentActivityCount(): number {
    const now = new Date();

    return this.logs.filter((log) => {
      if (!log.created_at) {
        return false;
      }

      const createdAt = new Date(log.created_at);
      if (Number.isNaN(createdAt.getTime())) {
        return false;
      }

      const diff = now.getTime() - createdAt.getTime();
      return diff >= 0 && diff <= 7 * 24 * 60 * 60 * 1000;
    }).length;
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

  getPageSummary(): string {
    if (this.isLoading) {
      return 'Preparing the latest audit entries.';
    }

    if (this.errorMessage) {
      return 'The audit stream is temporarily unavailable.';
    }

    return `${this.getVisibleLogCount()} of ${this.getTotalLogs()} logs visible across ${this.getUniqueEntityCount()} tracked entities.`;
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
