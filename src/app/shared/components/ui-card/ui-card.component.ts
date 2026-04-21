import { Component, Input } from '@angular/core';

type CardVariant = 'default' | 'elevated' | 'interactive';
type CardColor = 'slate' | 'indigo' | 'rose' | 'emerald' | 'violet';

@Component({
  selector: 'ui-card',
  standalone: true,
  imports: [],
  templateUrl: './ui-card.component.html',
  styleUrl: './ui-card.component.css'
})
export class UICardComponent {
  @Input() variant: CardVariant = 'default';
  @Input() color: CardColor = 'slate';
}

