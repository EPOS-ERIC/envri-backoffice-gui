import { Location as LocationType } from 'generated/backofficeSchemas';
import { Status } from 'src/utility/enums/status.enum';

export class LocationModel implements LocationType {
  constructor(
    public readonly changeComment: string,
    public readonly changeTimestamp: string,
    public readonly editorId: string,
    public readonly fileProvenance: string,
    public readonly groups: string[],
    public readonly instanceChangedId: string,
    public readonly instanceId: string,
    public readonly location: string,
    public readonly metaId: string,
    public readonly operation: string,
    public readonly status: Status,
    public readonly toBeDelete: string,
    public readonly uid: string,
    public readonly version: string,
    public readonly versionId: string,
  ) {}
}
