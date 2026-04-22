import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { AuditLog } from '../../models/audit-log.model';

@Component({
  selector: 'app-log-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './log-card.html',
  styleUrl: './log-card.css',
})
export class LogCard {
  @Input({ required: true }) log!: AuditLog;

  get actionTone(): string {
    switch (this.normalizedAction) {
      case 'create':
        return 'text-emerald-700 bg-emerald-50 ring-emerald-100';
      case 'update':
        return 'text-amber-700 bg-amber-50 ring-amber-100';
      case 'delete':
        return 'text-rose-700 bg-rose-50 ring-rose-100';
      default:
        return 'text-slate-700 bg-slate-100 ring-slate-200';
    }
  }

  get iconTone(): string {
    switch (this.normalizedAction) {
      case 'create':
        return 'bg-emerald-50 text-emerald-600';
      case 'update':
        return 'bg-amber-50 text-amber-600';
      case 'delete':
        return 'bg-rose-50 text-rose-600';
      default:
        return 'bg-slate-100 text-slate-500';
    }
  }

  get normalizedAction(): string {
    return (this.log?.action ?? '').trim().toLowerCase();
  }

  get actionDisplay(): string {
    return this.normalizedAction ? this.normalizedAction.toUpperCase() : 'EVENT';
  }

  get userLabel(): string {
    return this.log?.user_id ? `User #${this.log.user_id}` : 'System';
  }

  get entityLabel(): string {
    const type = this.log?.entity_type || 'Unknown entity';
    const id = this.log?.entity_id ? `#${this.log.entity_id}` : 'N/A';
    return `${type} ${id}`;
  }

  get userInitials(): string {
    return this.log?.user_id ? `U${String(this.log.user_id).slice(-1)}` : 'SY';
  }
}
