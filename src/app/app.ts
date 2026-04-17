import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ProfileTutorialComponent } from './shared/components/profile-tutorial/profile-tutorial.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ProfileTutorialComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('AssessmentBilling');
}
