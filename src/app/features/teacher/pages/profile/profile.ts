import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProfileService, TeacherProfile } from '../../../../shared/services/profile.service';
import { AuthService } from '../../../auth/services/auth.service';

@Component({
  selector: 'app-teacher-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profile.html',
  styleUrl: './profile.css',
})
export class Profile implements OnInit {
  profile: TeacherProfile | null = null;
  isLoading = false;
  isSaving = false;
  successMessage = '';
  errorMessage = '';
  isEditing = false;
  departments = [
    'Computer Science',
    'Mathematics',
    'English',
    'Science',
    'Social Studies',
    'Physical Education',
    'Business',
    'Engineering'
  ];

  constructor(
    private profileService: ProfileService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadProfile();
  }

  loadProfile(): void {
    const currentUser = this.authService.currentUser$ as any;
    currentUser.subscribe((user: any) => {
      if (user?.id) {
        this.isLoading = true;
        this.profileService.getTeacherProfile(user.id).subscribe({
          next: (data) => {
            this.profile = data;
            this.isLoading = false;
          },
          error: (err) => {
            console.error('Error loading profile:', err);
            this.errorMessage = 'Failed to load profile. Please try again.';
            this.isLoading = false;
          }
        });
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
        this.profileService.updateTeacherProfile(user.id, this.profile!).subscribe({
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
