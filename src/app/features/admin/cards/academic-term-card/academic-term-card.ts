import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AcademicTerm } from '../../models/academic-term.model';

@Component({
  selector: 'app-academic-term-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './academic-term-card.html',
  styleUrl: './academic-term-card.css',
})
export class AcademicTermCard {
  @Input() term!: AcademicTerm;
}
