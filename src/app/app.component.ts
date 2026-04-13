import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AlertToastComponent } from './shared/alert-toast/alert-toast.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, AlertToastComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {}
