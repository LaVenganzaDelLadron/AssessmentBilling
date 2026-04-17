import { Injectable } from '@angular/core';
import {
  CanActivate,
  CanActivateChild,
  Router,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  UrlTree,
} from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService, UserRole } from '../../features/auth/services/auth.service';


@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate, CanActivateChild {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    return this.checkAuth(state.url, route);
  }

  canActivateChild(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    return this.checkAuth(state.url, route);
  }

  private checkAuth(url: string, route: ActivatedRouteSnapshot): boolean | UrlTree {
    if (this.authService.isLoggedIn()) {
      const requiredRoles = route.data['roles'] as UserRole[] | undefined;

      if (!requiredRoles || this.authService.hasRole(requiredRoles)) {
        return true;
      } else {
        // User is logged in but doesn't have the required role
        return this.router.parseUrl('/');
      }
    } else {
      // User is not logged in, redirect to login
      return this.router.parseUrl('/login');
    }
  }
}

@Injectable({
  providedIn: 'root',
})
export class AdminGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    if (this.authService.isLoggedIn() && this.authService.hasRole('admin')) {
      return true;
    }
    return this.router.parseUrl('/login');
  }
}

@Injectable({
  providedIn: 'root',
})
export class TeacherGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    if (this.authService.isLoggedIn() && this.authService.hasRole('teacher')) {
      return true;
    }
    return this.router.parseUrl('/login');
  }
}

@Injectable({
  providedIn: 'root',
})
export class StudentGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    if (this.authService.isLoggedIn() && this.authService.hasRole('student')) {
      return true;
    }
    return this.router.parseUrl('/login');
  }
}
