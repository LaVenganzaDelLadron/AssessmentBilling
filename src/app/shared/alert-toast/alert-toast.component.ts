import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { AlertService, AlertToast } from '../../core/alert.service';

@Component({
  selector: 'app-alert-toast',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './alert-toast.component.html'
})
export class AlertToastComponent {
  readonly alertService = inject(AlertService);
  readonly toasts = this.alertService.toasts;

  trackById(_: number, item: AlertToast) {
    return item.id;
  }
}
