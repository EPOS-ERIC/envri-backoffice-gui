import { Observable } from 'rxjs';
import { Injector } from '@angular/core';
import { AuthenticationProvider } from './authProvider.interface';
import { AAAIUser } from './aaaiUser.interface';
import { OAuthAuthenticationProvider } from './impl/oAuthProvider';
import { OAuthService } from 'angular-oauth2-oidc';
import { Router } from '@angular/router';
import { LogService } from 'src/services/log.service';

/**
 * This uses a plugin ({@link https://www.npmjs.com/package/angular-oauth2-oidc})
 * to handle most of the interactions with the AAAI service.
 * It provides a global interface that exposes login,
 * logout and user information access to the rest of the GUI.
 */
export class AaaiService {
  private readonly now = new Date();
  private readonly logOutAfterInactivityPeriod = this.now.setHours(this.now.getHours() + 1);
  private readonly logoutTime = new Date(this.logOutAfterInactivityPeriod);

  private constructor(
    private readonly authProvider: AuthenticationProvider,
    private readonly router: Router,
    private readonly logger: LogService,
  ) {
    this.startLogoutInterval();
  }

  /** Static factory method that creates and configures aaai service */
  public static make(authProvider: AuthenticationProvider, router: Router, logger: LogService): AaaiService {
    return new AaaiService(authProvider, router, logger);
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
    return this.authProvider.initializeAuth();
  }

  public logout(): void {
    this.authProvider.logout();
    this.router.navigate(['/login']);
  }

  public getManageUrl(): string {
    return this.authProvider.getManageUrl();
  }

  public isAuthenticated(): boolean {
    return this.authProvider.isAuthenticated();
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

  private startLogoutInterval(): void {
    setInterval(() => {
      if (null != this.getUser() && this.logoutTime < new Date()) {
        this.logger.info('Time to log out');
        this.logout();
        this.router.navigate(['/login']);
      }
    }, 60 * 1000); // 1 mins
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
  logger: LogService,
): AaaiService => {
  const authProvider: AuthenticationProvider = new OAuthAuthenticationProvider(injector, oAuthService);
  return AaaiService.make(authProvider, router, logger);
};

/**
 * Provider for injection.
 */
export const aaaiServiceProvider = {
  provide: AaaiService,
  useFactory: aaaiServiceFactory,
  deps: [Injector, OAuthService, Router, LogService],
};
