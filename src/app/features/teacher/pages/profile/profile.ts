import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ProfileService, TeacherProfile } from '../../../../shared/services/profile.service';

@Component({
  selector: 'app-teacher-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profile.html',
  styleUrl: './profile.css',
})
export class Profile implements OnInit {
  private readonly destroyRef = inject(DestroyRef);

  profile: TeacherProfile | null = null;
  private originalProfile: TeacherProfile | null = null;
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
    private profileService: ProfileService
  ) {}

  ngOnInit(): void {
    this.loadProfile();
  }

  loadProfile(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.profileService.getTeacherProfile()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (data) => {
          this.profile = { ...data };
          this.originalProfile = { ...data };
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Error loading profile:', err);
          this.errorMessage = 'Failed to load teacher profile. Please try again.';
          this.isLoading = false;
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

    this.profileService.updateTeacherProfile(this.profile)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (data) => {
          this.profile = { ...data };
          this.originalProfile = { ...data };
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

  cancel(): void {
    this.profile = this.originalProfile ? { ...this.originalProfile } : this.profile;
    this.isEditing = false;
    this.errorMessage = '';
    this.successMessage = '';
  }

  get fullName(): string {
    if (!this.profile) {
      return 'Teacher';
    }

    return [this.profile.first_name, this.profile.middle_name, this.profile.last_name]
      .filter(Boolean)
      .join(' ')
      .trim();
  }

  get teacherStatusLabel(): string {
    return this.profile?.status === 'inactive' ? 'Inactive' : 'Active';
  }
}
