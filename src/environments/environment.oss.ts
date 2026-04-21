import { environmentBase } from './environment.base';

const authRootUrl = '__AUTH_ROOT_URL__';

export const environment = {
  ...environmentBase,
  ...{
    brandLogoPath: 'assets/img/logo/logo-opensource-1-light.png',
    faviconPath: 'assets/img/favicon/favicon-opensource.ico',
    headerLogoPath: 'assets/img/logo/logo-opensource-1-light.png',
    termsAndConditionsText: 'This application is being provided by the EPOS Platform Open Source project',
    authRootUrl: authRootUrl.startsWith('http') ?  authRootUrl : 'http://localhost:35000',
    production: true,
  },
};
