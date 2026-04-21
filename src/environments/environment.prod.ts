import { environmentBase } from './environment.base';

const authRootUrl = '__AUTH_ROOT_URL__';

export const environment = {
  ...environmentBase,
  ...{
    production: true,
    authRootUrl: authRootUrl.startsWith('http') ?  authRootUrl : 'https://login.staging.envri.eu/auth/realms/envri',
  },
};
