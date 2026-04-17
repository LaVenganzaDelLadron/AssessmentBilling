import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProfileService, StudentProfile } from '../../../../shared/services/profile.service';
import { AuthService } from '../../../auth/services/auth.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profile.html',
  styleUrl: './profile.css',
})
export class Profile implements OnInit {
  profile: StudentProfile | null = null;
  isLoading = false;
  isSaving = false;
  successMessage = '';
  errorMessage = '';
  isEditing = false;
  yearLevels = [1, 2, 3, 4, 5];
  programs: any[] = [];

  constructor(
    private profileService: ProfileService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadProfile();
    this.loadPrograms();
  }

  loadProfile(): void {
    const currentUser = this.authService.currentUser$ as any;
    currentUser.subscribe((user: any) => {
      if (user?.id) {
        this.isLoading = true;
        this.profileService.getStudentProfile(user.id).subscribe({
          next: (data) => {
            this.profile = data;
            this.isLoading = false;
          },
          error: (err) => {
            console.error('Error loading profile:', err);
            this.errorMessage = 'Failed to load profile';
            this.isLoading = false;
          }
        });
      }
    });
  }

  loadPrograms(): void {
    this.profileService.getPrograms().subscribe({
      next: (data) => {
        this.programs = data;
      },
      error: (err) => {
        console.error('Error loading programs:', err);
      }
    });
  }

  toggleEdit(): void {
    this.isEditing = !this.isEditing;
    this.successMessage = '';
    this.errorMessage = '';
  }

  saveProfile(): void {
    if (!this.profile) return;

    this.isSaving = true;
    this.successMessage = '';
    this.errorMessage = '';

    const currentUser = this.authService.currentUser$ as any;
    currentUser.subscribe((user: any) => {
      if (user?.id) {
        this.profileService.updateStudentProfile(user.id, this.profile!).subscribe({
          next: (data) => {
            this.profile = data;
            this.isEditing = false;
            this.isSaving = false;
            this.successMessage = 'Profile updated successfully!';
            setTimeout(() => {
              this.successMessage = '';
            }, 3000);
          },
          error: (err) => {
            console.error('Error saving profile:', err);
            this.errorMessage = 'Failed to save profile. Please try again.';
            this.isSaving = false;
          }
        });
      }
    });
  }

  cancel(): void {
    this.isEditing = false;
    this.errorMessage = '';
    this.successMessage = '';
  }
}
