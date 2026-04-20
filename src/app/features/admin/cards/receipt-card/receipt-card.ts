import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OfficialReceipt } from '../../models/official-receipt.model';

@Component({
  selector: 'app-receipt-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './receipt-card.html',
  styleUrl: './receipt-card.css',
})
export class ReceiptCard {
  @Input() receipt!: OfficialReceipt;
}
