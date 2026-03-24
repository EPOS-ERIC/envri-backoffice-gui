import { OAuthAuthenticationProvider } from 'src/aaai/impl/oAuthProvider';

export function authAppInitializer(authProvider: OAuthAuthenticationProvider): () => Promise<void> {
  return () => authProvider.init();
}
