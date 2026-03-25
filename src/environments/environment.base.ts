import { LogLevel } from 'src/utility/enums/log.enum';

const BACKOFFICE_HOME_PATH = '/backoffice/home';
const BACKOFFICE_LAST_PAGE_REDIRECT = '/backoffice/last-page-redirect';
const API_PATH = '/api/v1';

const resolveApiBaseUrl = (): string => {
  if (window.location.href.includes(BACKOFFICE_HOME_PATH) || window.location.href.includes(BACKOFFICE_LAST_PAGE_REDIRECT)) {
    let path = window.location.href.replace(BACKOFFICE_HOME_PATH, '');
    path = path.replace(BACKOFFICE_LAST_PAGE_REDIRECT, '');
    return path + API_PATH;
  }

  return window.location.href + API_PATH;
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

