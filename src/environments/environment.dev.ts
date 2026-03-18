import { LogLevel } from 'src/utility/enums/log.enum';
import { environment as productionEnvironment } from './environment.prod';

export const environment = {
  ...productionEnvironment,
  ...{
    production: false,
    apiBaseUrl: 'http://localhost:4200/api',
    logLevel: LogLevel.debug,
  },
};
