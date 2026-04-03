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
  authClientId: 'eposICS',
  authRootUrl: 'https://aaai.epos-eu.org',
  authScope: ['openid', 'profile', 'single-logout'].join(' '),
  brandLogoPath: 'assets/img/logo.svg',
  browserTitle: 'EPOS Backoffice',
  faviconPath: 'assets/favicon.ico',
  headerLogoPath: 'assets/EPOS_logo_white_orange.png',
  headerTitle: 'METADATA Backoffice',
  loginTitle: 'EPOS Backoffice',
  termsAndConditionsText: 'By using EPOS ICS portal you accept the EPOS terms and conditions.',
  useLiveApi: true,
  logLevel: LogLevel.info,
};
