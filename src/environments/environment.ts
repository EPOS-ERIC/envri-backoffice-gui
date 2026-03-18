import { environment as environmentFlavor } from './environment.flavor';
import { environment as environmentMode } from './environment.mode';

export const environment = {
  ...environmentMode,
  ...environmentFlavor,
};
