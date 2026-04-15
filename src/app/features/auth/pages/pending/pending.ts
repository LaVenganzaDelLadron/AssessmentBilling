import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-pending',
  standalone: true,
  imports: [],
  templateUrl: './pending.html',
  styleUrl: './pending.css',
})
export class PendingComponent {
  @Output() closed = new EventEmitter<void>();

  close() {
    this.closed.emit();
  }
}
