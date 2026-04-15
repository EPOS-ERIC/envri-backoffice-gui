import { environmentBase } from './environment.base';

const authRootUrl = '__AUTH_ROOT_URL__';

export const environment = {
  ...environmentBase,
  ...{
    production: true,
    authRootUrl: authRootUrl === '__AUTH_ROOT_URL__' ? 'https://login.staging.envri.eu/auth/realms/envri' : authRootUrl,
  },
};
