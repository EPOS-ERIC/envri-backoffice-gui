import { Observable } from 'rxjs';
import { Injector, inject } from '@angular/core';
import { AuthenticationProvider } from './authProvider.interface';
import { AAAIUser } from './aaaiUser.interface';
import { OAuthAuthenticationProvider } from './impl/oAuthProvider';
import { OAuthService } from 'angular-oauth2-oidc';
import { PersistorService, StorageType } from 'src/services/persistor.service';
import { StorageKey } from 'src/utility/enums/storageKey.enum';
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
  private readonly persistorService = new PersistorService();
  private readonly router = new Router();
  private readonly logger = inject(LogService);

  private constructor(private readonly authProvider: AuthenticationProvider) {
    this.startLogoutInterval();
  }

  /** Static factory method that creates and configures aaai service */
  public static make(authProvider: AuthenticationProvider): AaaiService {
    return new AaaiService(authProvider);
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

  public logout(): void {
    this.authProvider.logout();
    this.router.navigate(['/login']);
  }

  public getManageUrl(): string {
    return this.authProvider.getManageUrl();
  }

  public isAuthenticated(): boolean {
    // const accessToken = this.persistorService.getValueFromStorage(StorageType.SESSION_STORAGE, StorageKey.ACCESS_TOKEN);
    // console.log(accessToken);
    // return accessToken != null;
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
export const aaaiServiceFactory = (injector: Injector, oAuthService: OAuthService): AaaiService => {
  // const authProvider: AuthenticationProvider = new OAuthAuthenticationProvider(injector, oAuthService);
  // return AaaiService.make(authProvider);
  const authProvider = injector.get(OAuthAuthenticationProvider);
  return AaaiService.make(authProvider);
};

/**
 * Provider for injection.
 */
export const aaaiServiceProvider = {
  provide: AaaiService,
  useFactory: aaaiServiceFactory,
  deps: [Injector, OAuthService],
};
