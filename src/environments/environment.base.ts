import { LogLevel } from 'src/utility/enums/log.enum';

const API_PATH = '/api/v1';
const BACKOFFICE_SUFFIX = '/backoffice/';

const normalizePath = (path: string): string => {
  const withLeadingSlash = path.startsWith('/') ? path : `/${path}`;
  return withLeadingSlash.endsWith('/') ? withLeadingSlash : `${withLeadingSlash}/`;
};

const removeBackofficeSuffix = (path: string): string => {
  const normalizedPath = normalizePath(path);

  if (!normalizedPath.endsWith(BACKOFFICE_SUFFIX)) {
    return normalizedPath;
  }

  const pathWithoutSuffix = normalizedPath.slice(0, -BACKOFFICE_SUFFIX.length);
  return normalizePath(pathWithoutSuffix === '' ? '/' : pathWithoutSuffix);
};

const resolveApiBaseUrl = (): string => {
  const baseUrl = new URL(document.baseURI);
  const pathWithoutBackoffice = removeBackofficeSuffix(baseUrl.pathname);
  const apiPath = API_PATH.startsWith('/') ? API_PATH.slice(1) : API_PATH;

  return new URL(apiPath, `${baseUrl.origin}${pathWithoutBackoffice}`).toString().replace(/\/$/, '');
};

export const environmentBase = {
  apiBaseUrl: resolveApiBaseUrl(),
  authClientId: '2d7f667e-9d6c-4c09-ad15-ceec571ae554',
  authRootUrl: 'https://login.staging.envri.eu/auth/realms/envri',
  authScope: ['openid', 'profile', 'email', 'offline_access'].join(' '),
  brandLogoPath: 'assets/img/logo-envri-hub-centered-color.png',
  browserTitle: 'EPOS Backoffice',
  faviconPath: 'assets/favicon.ico',
  headerLogoPath: 'assets/ENVRI-Hub-logo-white.svg',
  headerTitle: 'METADATA Backoffice',
  loginTitle: 'ENVRI Backoffice',
  termsAndConditionsText: 'By using ENVRI portal you accept the ENVRI-Hub-Next terms and conditions.',
  useLiveApi: true,
  logLevel: LogLevel.info,
};
