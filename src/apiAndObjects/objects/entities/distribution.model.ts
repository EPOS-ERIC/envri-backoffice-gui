import { Distribution as DistributionType, LinkedEntity } from 'generated/backofficeSchemas';

export class Distribution implements DistributionType {
  constructor(
    public uid?: string,
    public accessURL?: Array<string>,
    public changeComment?: string,
    public changeTimestamp?: string,
    public dataPolicy?: string,
    public dataProduct?: Array<LinkedEntity>,
    public description?: Array<string>,
    public downloadURL?: Array<string>,
    public editorId?: string,
    public fileProvenance?: string,
    public format?: string,
    public groups?: Array<string>,
    public instanceChangedId?: string,
    public instanceId?: string,
    public issued?: string,
    public licence?: string,
    public metaId?: string,
    public modified?: string,
    public operation?: string,
    public state?: DistributionType['status'],
    public supportedOperation?: Array<LinkedEntity>,
    public title?: Array<string>,
    public toBeDelete?: string,
    public type?: string,
    public version?: string,
  ) {}
}
