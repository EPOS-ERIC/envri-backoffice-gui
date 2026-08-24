import { inject, Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateFn, Router, RouterStateSnapshot } from '@angular/router';
import { AaaiService } from 'src/aaai/aaai.service';
import { ActiveUserService } from 'src/services/activeUser.service';
import { SnackbarService, SnackbarType } from 'src/services/snackbar.service';

@Injectable({
  providedIn: 'root',
})
export class PermissionsService {
  constructor(
    private readonly router: Router,
    private readonly activeUserService: ActiveUserService,
    private readonly snackbarService: SnackbarService,
  ) { }

  public canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    void next;
    void state;
    const activeUser = inject(ActiveUserService).getActiveUser();
    if (activeUser?.groups?.length === 0) {
      this.router.navigate(['groups']);
      this.snackbarService.openSnackbar('Please join or create a group.', 'close', SnackbarType.WARNING, 6000, [
        'snackbar',
        'mat-toolbar',
        'snackbar-warning',
      ]);
      return false;
    }
    return true;
  }
}

export const ActiveGroupMember: CanActivateFn = (next: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean => {
  return inject(PermissionsService).canActivate(next, state);
};

// export const AuthenticatedUser: CanActivateFn = (next: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean => {
//   if (state.url.startsWith('/last-page-redirect')) {
//     return true; // Allow access to last-page-redirect for auth callback
//   }
//
//   if (inject(AaaiService).isAuthenticated()) {
//     return true;
//   } else {
//     inject(Router).navigate(['/login']);
//     return false;
//   }
export const AuthenticatedUser: CanActivateFn = (next: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean => {
  const router = inject(Router);
  const auth = inject(AaaiService);

  // ✅ Always allow the OAuth callback route
  if (next.routeConfig?.path === 'last-page-redirect') {
    return true;
  }

  // ✅ User already authenticated
  if (auth.isAuthenticated()) {
    return true;
  }

  // ❌ Not authenticated → redirect to login,
  // and keep the returnUrl so we can restore after login
  router.navigate(['/login'], {
    queryParams: { returnUrl: state.url },
  });
  return false;
};
