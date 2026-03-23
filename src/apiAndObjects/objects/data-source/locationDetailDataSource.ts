import { Location as LocationType } from 'generated/backofficeSchemas';
import { BaseObject } from 'src/apiAndObjects/_lib_code/objects/baseObject';
import { Status } from 'src/utility/enums/status.enum';

export class LocationDataSource extends BaseObject implements LocationType {
  public static readonly KEYS = {
    CHANGE_COMMENT: 'changeComment',
    CHANGE_TIMESTAMP: 'changeTimestamp',
    EDITOR_ID: 'editorId',
    FILE_PROVENANCE: 'fileProvenance',
    GROUPS: 'groups',
    INSTANCE_CHANGED_ID: 'instanceChangedId',
    INSTANCE_ID: 'instanceId',
    LOCATION: 'location',
    META_ID: 'metaId',
    OPERATION: 'operation',
    STATUS: 'status',
    TO_BE_DELETE: 'toBeDelete',
    UID: 'uid',
    VERSION: 'version',
    VERSION_ID: 'versionId',
  };

  public readonly changeComment: string;
  public readonly changeTimestamp: string;
  public readonly editorId: string;
  public readonly fileProvenance: string;
  public readonly groups: string[];
  public readonly instanceChangedId: string;
  public readonly instanceId: string;
  public readonly location: string;
  public readonly metaId: string;
  public readonly operation: string;
  public readonly status: Status;
  public readonly toBeDelete: string;
  public readonly uid: string;
  public readonly version: string;
  public readonly versionId: string;

  protected constructor(sourceObject?: Record<string, unknown>) {
    super(sourceObject);
    this.changeComment = this._getString(LocationDataSource.KEYS.CHANGE_COMMENT);
    this.changeTimestamp = this._getString(LocationDataSource.KEYS.CHANGE_TIMESTAMP);
    this.editorId = this._getString(LocationDataSource.KEYS.EDITOR_ID);
    this.fileProvenance = this._getString(LocationDataSource.KEYS.FILE_PROVENANCE);
    this.groups = this._getArray(LocationDataSource.KEYS.GROUPS);
    this.instanceChangedId = this._getString(LocationDataSource.KEYS.INSTANCE_CHANGED_ID);
    this.instanceId = this._getString(LocationDataSource.KEYS.INSTANCE_ID);
    this.location = this._getString(LocationDataSource.KEYS.LOCATION);
    this.metaId = this._getString(LocationDataSource.KEYS.META_ID);
    this.operation = this._getString(LocationDataSource.KEYS.OPERATION);
    this.status = this._getValue(LocationDataSource.KEYS.STATUS) as Status;
    this.toBeDelete = this._getString(LocationDataSource.KEYS.TO_BE_DELETE);
    this.uid = this._getString(LocationDataSource.KEYS.UID);
    this.version = this._getString(LocationDataSource.KEYS.VERSION);
    this.versionId = this._getString(LocationDataSource.KEYS.VERSION_ID);
  }
}
