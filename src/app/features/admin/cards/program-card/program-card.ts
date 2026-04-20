import { Component, Input } from '@angular/core';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-program-card',
  standalone: true,
  imports: [DatePipe],
  templateUrl: './program-card.html',
  styleUrl: './program-card.css',
})
export class ProgramCard {
  @Input() program: any;
}
