import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface TutorialState {
  isFirstLogin: boolean;
  showProfileTutorial: boolean;
  profileType: 'student' | 'teacher' | null;
}

@Injectable({
  providedIn: 'root'
})
export class TutorialService {
  private tutorialState = new BehaviorSubject<TutorialState>({
    isFirstLogin: false,
    showProfileTutorial: false,
    profileType: null
  });

  tutorialState$ = this.tutorialState.asObservable();

  constructor() {}

  checkFirstLogin(userId: number, userRole: 'student' | 'teacher' | 'admin' | 'guest'): boolean {
    const lastLoginUserId = localStorage.getItem('lastLoginUserId');
    const isFirstLogin = lastLoginUserId !== String(userId);

    if (isFirstLogin && userRole !== 'admin') {
      this.tutorialState.next({
        isFirstLogin: true,
        showProfileTutorial: true,
        profileType: userRole as 'student' | 'teacher'
      });
      localStorage.setItem('lastLoginUserId', String(userId));
    }

    return isFirstLogin && userRole !== 'admin';
  }

  dismissTutorial(): void {
    this.tutorialState.next({
      isFirstLogin: false,
      showProfileTutorial: false,
      profileType: null
    });
  }

  getTutorialState(): TutorialState {
    return this.tutorialState.value;
  }
}
