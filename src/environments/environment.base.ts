import { LogLevel } from 'src/utility/enums/log.enum';

const BACKOFFICE_HOME_PATH = '/backoffice/home';
const API_PATH = '/api/v1';

const resolveApiBaseUrl = (): string => {
  if (window.location.href.includes(BACKOFFICE_HOME_PATH)) {
    return window.location.href.replace(BACKOFFICE_HOME_PATH, '') + API_PATH;
  }

  return window.location.href + API_PATH;
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
