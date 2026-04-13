import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-ui-button',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ui-button.component.html'
})
export class UiButtonComponent {
  @Input() label = 'Button';
  @Input() type: 'button' | 'submit' | 'reset' = 'button';
  @Input() variant: 'primary' | 'secondary' | 'ghost' | 'danger' = 'primary';
  @Input() disabled = false;
  @Input() fullWidth = false;

  @Output() pressed = new EventEmitter<void>();

  onPress() {
    if (this.disabled) return;
    this.pressed.emit();
  }
}
