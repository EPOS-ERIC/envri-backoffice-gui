const authRootUrl = '__AUTH_ROOT_URL__';

export const environment = {
  ...{
    brandLogoPath: 'assets/img/logo/logo-opensource-1-light.png',
    faviconPath: 'assets/img/favicon/favicon-opensource.ico',
    headerLogoPath: 'assets/img/logo/logo-opensource-1-light.png',
    termsAndConditionsText: 'This application is being provided by the EPOS Platform Open Source project',
    authRootUrl: authRootUrl === '__AUTH_ROOT_URL__' ? 'http://localhost:35000' : authRootUrl,
    production: true,
  },
};
