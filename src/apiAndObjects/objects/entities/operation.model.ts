import { DataProduct, LinkedEntity, Operation as OperationType } from 'generated/backofficeSchemas';

export class Operation implements OperationType {
  constructor(
    public changeComment?: string,
    public changeTimestamp?: string,
    public editorId?: string,
    public fileProvenance?: string,
    public groups?: Array<string>,
    public instanceChangedId?: string,
    public instanceId?: string,
    public mapping?: Array<LinkedEntity>,
    public metaId?: string,
    public method?: string,
    public operation?: string,
    public returns?: Array<string>,
    public state?: DataProduct['status'],
    public template?: string,
    public toBeDelete?: string,
    public uid?: string,
    public version?: string,
    public versionId?: string,
  ) {}
}
