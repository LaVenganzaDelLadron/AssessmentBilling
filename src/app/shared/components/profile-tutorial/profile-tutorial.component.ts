import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { TutorialService } from '../../services/tutorial.service';

@Component({
  selector: 'app-profile-tutorial',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div *ngIf="showTutorial" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-lg shadow-2xl max-w-md w-full p-8 animate-fadeIn">
        <!-- Icon -->
        <div class="flex justify-center mb-4">
          <div class="bg-blue-100 rounded-full p-4">
            <svg class="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          </div>
        </div>

        <!-- Header -->
        <h2 class="text-2xl font-bold text-slate-900 text-center mb-2">Welcome! 👋</h2>
        <p class="text-slate-600 text-center mb-6">
          Let's get you started by completing your {{ profileType }} profile.
        </p>

        <!-- Content -->
        <div class="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h3 class="font-semibold text-blue-900 mb-3">What we need from you:</h3>
          <ul class="space-y-2 text-sm text-blue-800">
            <li *ngIf="profileType === 'student'" class="flex gap-2">
              <span class="text-blue-600">✓</span>
              <span>Student Number & Personal Information</span>
            </li>
            <li *ngIf="profileType === 'student'" class="flex gap-2">
              <span class="text-blue-600">✓</span>
              <span>Program & Year Level</span>
            </li>
            <li *ngIf="profileType === 'teacher'" class="flex gap-2">
              <span class="text-blue-600">✓</span>
              <span>Teacher ID & Personal Information</span>
            </li>
            <li *ngIf="profileType === 'teacher'" class="flex gap-2">
              <span class="text-blue-600">✓</span>
              <span>Department & Status</span>
            </li>
          </ul>
        </div>

        <!-- Why Important -->
        <div class="mb-6">
          <p class="text-sm text-slate-600 mb-2">
            <strong>Why?</strong> This information helps the system manage assessments, enrollments, and billing correctly.
          </p>
        </div>

        <!-- Buttons -->
        <div class="flex gap-3">
          <button
            (click)="goToProfile()"
            class="flex-1 bg-blue-600 text-white font-medium py-2 rounded-lg hover:bg-blue-700 transition"
          >
            Complete Profile →
          </button>
          <button
            (click)="skipTutorial()"
            class="px-4 py-2 bg-slate-200 text-slate-700 font-medium rounded-lg hover:bg-slate-300 transition"
          >
            Later
          </button>
        </div>

        <!-- Tip -->
        <p class="text-xs text-slate-500 text-center mt-4">
          💡 You can always update your profile later from the Profile menu.
        </p>
      </div>
    </div>
  `,
  styles: [`
    @keyframes fadeIn {
      from {
        opacity: 0;
        transform: scale(0.95);
      }
      to {
        opacity: 1;
        transform: scale(1);
      }
    }

    .animate-fadeIn {
      animation: fadeIn 0.3s ease-out;
    }
  `]
})
export class ProfileTutorialComponent implements OnInit {
  showTutorial = false;
  profileType: 'student' | 'teacher' | null = null;

  constructor(
    private tutorialService: TutorialService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.tutorialService.tutorialState$.subscribe(state => {
      this.showTutorial = state.showProfileTutorial;
      this.profileType = state.profileType;
    });
  }

  goToProfile(): void {
    this.skipTutorial();
    if (this.profileType === 'student') {
      this.router.navigate(['/student/profile']);
    } else if (this.profileType === 'teacher') {
      this.router.navigate(['/teacher/profile']);
    }
  }

  skipTutorial(): void {
    this.tutorialService.dismissTutorial();
  }
}
