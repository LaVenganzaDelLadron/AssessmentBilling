import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UiButtonComponent } from '../../../shared/components/ui-button/ui-button.component';
import { UiCardComponent } from '../../../shared/components/ui-card/ui-card.component';

@Component({
selector: 'app-assignment',
  standalone: true,
  imports: [CommonModule, UiButtonComponent, UiCardComponent],
  templateUrl: './assignment.html',
  styleUrl: './assignment.css',
})
export class AssignmentComponent {}
