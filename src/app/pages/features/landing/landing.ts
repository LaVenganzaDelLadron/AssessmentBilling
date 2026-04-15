import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { UiCardComponent } from '../../../shared/components/ui-card/ui-card.component';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [RouterLink, UiCardComponent],
  templateUrl: './landing.html',
  styleUrl: './landing.css'
})
export class LandingComponent {
}
