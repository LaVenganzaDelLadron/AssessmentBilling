import { inject } from '@angular/core';
import { CanActivateFn, Router, ActivatedRouteSnapshot } from '@angular/router';
import { AuthService } from '../../core/auth.service';
import { AlertService } from '../../core/alert.service';

export const RoleGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const alertService = inject(AlertService);
  const router = inject(Router);
  const routeSnapshot = route as ActivatedRouteSnapshot;

  const requiredRoles = routeSnapshot.data['roles'] as string[];

  if (!authService.getToken()) {
    router.navigate(['/auth']);
    return false;
  }

  if (!requiredRoles.includes(authService.currentRole())) {
    alertService.warning('Access denied');
    router.navigate(['/auth']);
    return false;
  }

  return true;
};
