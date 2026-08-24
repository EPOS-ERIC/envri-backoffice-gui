/* eslint-disable @typescript-eslint/no-empty-function */
import { AuthConfig, OAuthService, UserInfo } from 'angular-oauth2-oidc';
import { JwksValidationHandler } from 'angular-oauth2-oidc-jwks';
import { AuthenticationProvider } from '../authProvider.interface';
import { BehaviorSubject, Observable } from 'rxjs';
import { AAAIUser } from '../aaaiUser.interface';
import { BasicUser } from './basicUser';
import { Injectable, Injector } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from 'src/environments/environment';

/** OAuth provider implementation */
@Injectable()
export class OAuthAuthenticationProvider implements AuthenticationProvider {
  private static readonly AUTH_ROOT = environment.authRootUrl;
  private static readonly AUTH_ISSUER = OAuthAuthenticationProvider.AUTH_ROOT + '';
  private static readonly AUTH_REVOKE_ENDPOINT = OAuthAuthenticationProvider.AUTH_ISSUER + '/revoke';
  private static readonly REDIRECTION_PAGE = '/last-page-redirect';
  private static readonly SILENT_REFRESH_PAGE = '/silent-token-refresh.html';

  private readonly http: HttpClient;
  private authInitializationPromise: null | Promise<void> = null;

  private updateUserProfileTimeout!: NodeJS.Timeout;

  /** Current user */
  private readonly userProfileSource = new BehaviorSubject<null | AAAIUser>(null);

  constructor(injector: Injector, private readonly oAuthService: OAuthService) {
    this.http = injector.get(HttpClient);
  }

  public initializeAuth(): Promise<void> {
    if (this.authInitializationPromise == null) {
      this.authInitializationPromise = this.init();
    }

    return this.authInitializationPromise;
  }

  public isAuthenticated(): boolean {
    return this.oAuthService.hasValidAccessToken();
  }

  public watchForUserChange(): Observable<null | AAAIUser> {
    return this.userProfileSource.asObservable();
  }

  public getUser(): null | AAAIUser {
    return this.userProfileSource.getValue();
  }

  public getAccessTokenExpiration(): null | number {
    const expiration = this.oAuthService.getAccessTokenExpiration();
    return expiration ? expiration : null;
  }

  // TODO: angular-oauth2-oidc suggests that "Code Flow" rather than "Implicit Flow" should be favoured.
  // SHould we adopt that? https://www.npmjs.com/package/angular-oauth2-oidc
  public login(): void {
    this.oAuthService.initCodeFlow();
  }

  public logout(): void {
    // This only logs out the client.
    // in order to log out at the server, we need a logout url.
    void this.revokeTokenManually().then(() => {
      this.oAuthService.logOut();
    });
  }

  public getManageUrl(): string {
    return OAuthAuthenticationProvider.AUTH_ROOT;
  }

  private makeAuthConfig(): AuthConfig {
    const redirectUri = new URL(OAuthAuthenticationProvider.REDIRECTION_PAGE.slice(1), document.baseURI).toString();
    const silentRefreshRedirectUri = new URL(
      OAuthAuthenticationProvider.SILENT_REFRESH_PAGE.slice(1),
      document.baseURI,
    ).toString();

    const authConfig: AuthConfig = {
      // Url of the Identity Provider
      issuer: OAuthAuthenticationProvider.AUTH_ISSUER,

      // URL of the SPA to redirect the user to after login
      redirectUri,
      silentRefreshRedirectUri,

      // The SPA's id. The SPA is registerd with this id at the auth-server
      clientId: environment.authClientId,

      // set the scope for the permissions the client should request
      // The first three are defined by OIDC. The 4th is a usecase-specific one
      scope: environment.authScope,

      disableAtHashCheck: true,
    };
    return authConfig;
  }

  private async init(): Promise<void> {
    this.configure();
    this.oAuthService.tokenValidationHandler = new JwksValidationHandler();

    console.info('[AAAI][OAuth] init: configuring silent refresh');
    this.oAuthService.setupAutomaticSilentRefresh();
    console.info('[AAAI][OAuth] init: silent refresh configured');

    this.oAuthService.events.subscribe((e) => {
      switch (e.type) {
        case 'discovery_document_loaded':
          console.info('[AAAI][OAuth] discovery document loaded', e);
          break;
        case 'discovery_document_load_error':
          console.error('[AAAI][OAuth] discovery document load error', e);
          break;
        case 'token_received':
          console.info('[AAAI][OAuth] token received', e);
          this.updateUserProfile();
          break;
        case 'silently_refreshed':
          console.info('[AAAI][OAuth] silent refresh succeeded', e);
          this.updateUserProfile();
          break;
        case 'silent_refresh_error':
          console.error('[AAAI][OAuth] silent refresh failed', e);
          break;
        case 'silent_refresh_timeout':
          console.warn('[AAAI][OAuth] silent refresh timed out', e);
          break;
        case 'token_expires':
          console.info('[AAAI][OAuth] token expires', e);
          break;
        case 'token_refresh_error':
          console.error('[AAAI][OAuth] token refresh error', e);
          break;
        case 'session_error':
          console.error('[AAAI][OAuth] session error', e);
          break;
        case 'session_terminated':
          console.warn('[AAAI][OAuth] session terminated', e);
          break;
        case 'token_revoke_error':
          console.error('[AAAI][OAuth] token revoke error', e);
          break;
        case 'logout':
          console.info('[AAAI][OAuth] logout event received', e);
          this.userProfileSource.next(null);
          break;
        default:
          break;
      }
    });

    try {
      console.info('[AAAI][OAuth] loading discovery document and trying login');
      await this.oAuthService.loadDiscoveryDocumentAndTryLogin();
      console.info('[AAAI][OAuth] discovery document loaded and login checked');
    } catch (e) {
      console.error('Error loading discovery document and trying login', e);
    }

    if (this.oAuthService.hasValidAccessToken()) {
      console.info('[AAAI][OAuth] valid access token present after init');
      this.updateUserProfile();
    }

    this.oAuthService.events.subscribe((e) => {
      // angular-oauth2-oidc EventType string values
      switch (e.type) {
        case 'discovery_document_loaded':
        case 'token_received': // first logged in
        case 'logout': // logout to clear user info
          this.updateUserProfile();
          break;
      }
    });
  }

  private updateUserProfile(): void {
    console.warn('Update User Profile called');
    // ensure not called too often
    clearTimeout(this.updateUserProfileTimeout as NodeJS.Timeout);
    this.updateUserProfileTimeout = setTimeout(() => {
      const token = this.getUserToken();
      const currentProfile = this.userProfileSource.getValue();
      // only if the token has changed
      if (currentProfile == null || currentProfile.getToken() !== token) {
        // Try protects against a promise not being returned from "loadUserProfile" function.
        try {
          this.oAuthService
            .loadUserProfile()
            .then((object: object): void => {
              const userInfo = object as UserInfo;
              this.userProfileSource.next(BasicUser.makeFromProfileResponse(token, userInfo));

              // console.debug('scopes', this.oAuthService.getGrantedScopes());
              // console.debug('scopes', this.oAuthService.getIdentityClaims());
            })
            .catch((error: unknown) => {
              const userId = this.getUserId();
              const user = BasicUser.makeOrDefault(userId, userId, token, userId);
              this.userProfileSource.next(user);
            });
        } catch {
          this.userProfileSource.next(null);
        }
      }
    }, 100);
  }
  private configure() {
    this.oAuthService.configure(this.makeAuthConfig());
  }

  private revokeTokenManually(): Promise<void> {
    const httpOptions = {
      headers: new HttpHeaders({
        Authorization: 'Bearer ' + this.oAuthService.getAccessToken(),
        // eslint-disable-next-line @typescript-eslint/naming-convention
        'Content-Type': 'application/x-www-form-urlencoded',
      }),
    };

    // console.debug('authorizationHeader', this.oAuthService.authorizationHeader());
    return this.http.post(
        OAuthAuthenticationProvider.AUTH_REVOKE_ENDPOINT,
        `token=${this.oAuthService.getAccessToken()}` +
          `&client_id=${this.oAuthService.clientId}` +
          '&token_type_hint=access_token' +
          '&logout=true',
        httpOptions,
      )
      .toPromise()
      .then(() => {})
      .catch((e) => {
        console.warn('Unable to revoke Access Token', e);
      });
  }

  private getUserId(): null | string {
    const claims = this.oAuthService.getIdentityClaims() as Record<string, unknown>;
    if (claims) {
      return String(claims['sub']);
    }
    return null;
  }

  private getUserToken(): string {
    return this.oAuthService.getAccessToken();
  }
}
