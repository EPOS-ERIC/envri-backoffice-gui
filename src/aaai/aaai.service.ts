import { Observable } from 'rxjs';
import { Injector } from '@angular/core';
import { AuthenticationProvider } from './authProvider.interface';
import { AAAIUser } from './aaaiUser.interface';
import { OAuthAuthenticationProvider } from './impl/oAuthProvider';
import { OAuthService } from 'angular-oauth2-oidc';
import { Router } from '@angular/router';
import { SnackbarService, SnackbarType } from 'src/services/snackbar.service';
import { MatSnackBarRef } from '@angular/material/snack-bar';

/**
 * This uses a plugin ({@link https://www.npmjs.com/package/angular-oauth2-oidc})
 * to handle most of the interactions with the AAAI service.
 * It provides a global interface that exposes login,
 * logout and user information access to the rest of the GUI.
 */
export class AaaiService {
  // the timeout for logout
  private tokenLogoutTimeout: ReturnType<typeof setTimeout> | null = null;
  // the timeout for the warning snackbar (5 minutes before logout)
  private tokenWarningTimeout: ReturnType<typeof setTimeout> | null = null;
  private logoutWarningSnackbarRef: MatSnackBarRef<unknown> | null = null;

  private constructor(
    private readonly authProvider: AuthenticationProvider,
    private readonly router: Router,
    private readonly snackbarService: SnackbarService,
  ) {

    this.authProvider.watchForUserChange().subscribe(() => {
      // Sync the logout timer based on accessTokenExpiration value
      this.syncTokenLogoutTimer();
    });
  }

  /** Static factory method that creates and configures aaai service */
  public static make(authProvider: AuthenticationProvider, router: Router, snackbarService: SnackbarService): AaaiService {
    return new AaaiService(authProvider, router, snackbarService);
  }

  /**
   * Returns an Observable of {@link AAAIUser}.
   */
  public watchUser(): Observable<null | AAAIUser> {
    return this.authProvider.watchForUserChange();
  }
  /**
   * Get the current user.
   */
  public getUser(): null | AAAIUser {
    return this.authProvider.getUser();
  }

  public login(): void {
    this.authProvider.login();
  }

  public initializeAuth(): Promise<void> {
    return this.authProvider.initializeAuth().then(() => {
      this.syncTokenLogoutTimer();
    });
  }

  public logout(): void {
    // clear any existing timers and dismiss any warning snackbar
    this.clearTokenLogoutTimer();
    this.clearTokenWarningTimer();
    this.dismissLogoutWarning();
    // logout and navigate back to /login
    this.authProvider.logout();
    this.router.navigate(['/login']);
  }

  public getManageUrl(): string {
    return this.authProvider.getManageUrl();
  }

  public isAuthenticated(): boolean {
    return this.authProvider.isAuthenticated();
  }
  
  public getAccessTokenExpiration(): null | number {
    return this.authProvider.getAccessTokenExpiration();
  }

  public checkForAuth(): boolean {
    if (this.isAuthenticated()) {
      this.router.navigate(['/home']);
      return true;
    } else {
      this.router.navigate(['/login']);
      return false;
    }
  }

  private syncTokenLogoutTimer(): void {
    this.clearTokenLogoutTimer();
    this.clearTokenWarningTimer();

    const expiration = this.getAccessTokenExpiration();
    if (null == expiration) {
      return;
    }

    const remainingMs = expiration - Date.now();
    if (remainingMs <= 0) {
      this.tokenLogoutTimeout = setTimeout(() => this.logout(), 0);
      return;
    }

    const warningThresholdMs = 5 * 60 * 1000;
    const warningMs = remainingMs - warningThresholdMs;

    if (warningMs <= 0) {
      this.showLogoutWarning(remainingMs);
    } else {
      this.tokenWarningTimeout = setTimeout(() => this.showLogoutWarning(warningThresholdMs), warningMs);
    }

    this.tokenLogoutTimeout = setTimeout(() => {
      this.logout();
    }, remainingMs);
  }

  private clearTokenLogoutTimer(): void {
    if (null != this.tokenLogoutTimeout) {
      clearTimeout(this.tokenLogoutTimeout);
      this.tokenLogoutTimeout = null;
    }
  }

  private clearTokenWarningTimer(): void {
    if (null != this.tokenWarningTimeout) {
      clearTimeout(this.tokenWarningTimeout);
      this.tokenWarningTimeout = null;
    }
  }

  private showLogoutWarning(remainingMs: number): void {
    this.dismissLogoutWarning();
    const remainingMinutes = Math.max(1, Math.ceil(remainingMs / 60000));
    this.logoutWarningSnackbarRef = this.snackbarService.openSnackbar(
      `Please SAVE any active changes. Logout in ${remainingMinutes} minutes`,
      'close',
      SnackbarType.WARNING,
      remainingMs,
      ['snackbar', 'mat-toolbar', 'snackbar-warning'],
    );
  }

  private dismissLogoutWarning(): void {
    this.logoutWarningSnackbarRef?.dismiss();
    this.logoutWarningSnackbarRef = null;
  }
}

/**
 * Factory function.
 * @param router
 * @param oAuthService
 */
export const aaaiServiceFactory = (
  injector: Injector,
  oAuthService: OAuthService,
  router: Router,
): AaaiService => {
  const authProvider: AuthenticationProvider = new OAuthAuthenticationProvider(injector, oAuthService);
  const snackbarService = injector.get(SnackbarService);
  return AaaiService.make(authProvider, router, snackbarService);
};

/**
 * Provider for injection.
 */
export const aaaiServiceProvider = {
  provide: AaaiService,
  useFactory: aaaiServiceFactory,
  deps: [Injector, OAuthService, Router],
};
