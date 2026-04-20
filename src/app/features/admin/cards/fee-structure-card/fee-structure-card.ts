import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FeeStructure } from '../../models/fee-structure.model';

@Component({
  selector: 'app-fee-structure-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './fee-structure-card.html',
  styleUrl: './fee-structure-card.css',
})
export class FeeStructureCard {
  @Input() fee!: FeeStructure;
}
