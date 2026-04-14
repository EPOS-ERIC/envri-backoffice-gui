import { AAAIUser } from './aaaiUser.interface';
import { Observable } from 'rxjs';

/** Authentication Provider, abstraction via interface allow us to change the mode of authentication
 * without changes rippling throught he app. */
export interface AuthenticationProvider {
  initializeAuth(): Promise<void>;

  /**
   * Attempt to login.
   */
  login(): void;

  /**
   * Attempt to logout.
   */
  logout(): void;

  watchForUserChange(): Observable<null | AAAIUser>;
  getUser(): null | AAAIUser;
  isAuthenticated(): boolean;

  getManageUrl(): string;

  isAuthenticated(): boolean;
}
