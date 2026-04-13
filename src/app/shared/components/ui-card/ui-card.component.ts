import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-ui-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ui-card.component.html'
})
export class UiCardComponent {
  @Input() title = '';
  @Input() subtitle = '';
  @Input() value = '';
}
