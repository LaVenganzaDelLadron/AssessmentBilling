import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Refund } from '../../models/refund.model';

@Component({
  selector: 'app-refund-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './refund-card.html',
  styleUrl: './refund-card.css',
})
export class RefundCard {
  @Input() refund!: Refund;
}
