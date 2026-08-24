import { LinkedEntity } from 'generated/backofficeSchemas';
import { Status } from 'src/utility/enums/status.enum';

export interface TableDetail {
  uid?: string;
  title?: string[] | string;
  lastChange?: string;
  changeTimestamp?: string;
  status?: Status;
  changeComment?: string;
  author?: string;
  instanceId: string;
  metaId: string;
  versionInfo?: string;
  dataProduct?: LinkedEntity;
  group?: string;
}
