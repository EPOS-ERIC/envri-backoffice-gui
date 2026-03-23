import { LinkedEntity, ContactPoint as ContactPointType } from 'generated/backofficeSchemas';

export class ContactPoint implements ContactPointType {
  constructor(
    public uid?: string,
    public changeComment?: string,
    public changeTimestamp?: string,
    public editorId?: string,
    public email?: Array<string>,
    public fileProvenance?: string,
    public groups?: Array<string>,
    public instanceChangedId?: string,
    public instanceId?: string,
    public language?: Array<string>,
    public metaId?: string,
    public operation?: string,
    public organization?: LinkedEntity,
    public person?: LinkedEntity,
    public role?: string,
    public state?: ContactPointType['status'],
    public telephone?: Array<string>,
    public toBeDelete?: string,
    public version?: string,
  ) {}
}
