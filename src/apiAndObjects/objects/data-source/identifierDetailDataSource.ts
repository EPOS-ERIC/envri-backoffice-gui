import { Identifier as IdentifierType } from 'generated/backofficeSchemas';
import { BaseObject } from 'src/apiAndObjects/_lib_code/objects/baseObject';
import { Status } from 'src/utility/enums/status.enum';

export class IdentifierDataSource extends BaseObject implements IdentifierType {
  public static readonly KEYS = {
    CHANGE_COMMENT: 'changeComment',
    CHANGE_TIMESTAMP: 'changeTimestamp',
    EDITOR_ID: 'editorId',
    FILE_PROVENANCE: 'fileProvenance',
    GROUPS: 'groups',
    IDENTIFIER: 'identifier',
    INSTANCE_CHANGED_ID: 'instanceChangedId',
    INSTANCE_ID: 'instanceId',
    META_ID: 'metaId',
    OPERATION: 'operation',
    STATUS: 'status',
    TO_BE_DELETE: 'toBeDelete',
    TYPE: 'type',
    UID: 'uid',
    VERSION: 'version',
    VERSION_ID: 'versionId',
  };

  public readonly changeComment: string;
  public readonly changeTimestamp: string;
  public readonly editorId: string;
  public readonly fileProvenance: string;
  public readonly groups: string[];
  public readonly identifier: string;
  public readonly instanceChangedId: string;
  public readonly instanceId: string;
  public readonly metaId: string;
  public readonly operation: string;
  public readonly status: Status;
  public readonly toBeDelete: string;
  public readonly type: string;
  public readonly uid: string;
  public readonly version: string;
  public readonly versionId: string;

  protected constructor(sourceObject?: Record<string, unknown>) {
    super(sourceObject);
    this.changeComment = this._getString(IdentifierDataSource.KEYS.CHANGE_COMMENT);
    this.changeTimestamp = this._getString(IdentifierDataSource.KEYS.CHANGE_TIMESTAMP);
    this.editorId = this._getString(IdentifierDataSource.KEYS.EDITOR_ID);
    this.fileProvenance = this._getString(IdentifierDataSource.KEYS.FILE_PROVENANCE);
    this.groups = this._getArray(IdentifierDataSource.KEYS.GROUPS);
    this.identifier = this._getString(IdentifierDataSource.KEYS.IDENTIFIER);
    this.instanceChangedId = this._getString(IdentifierDataSource.KEYS.INSTANCE_CHANGED_ID);
    this.instanceId = this._getString(IdentifierDataSource.KEYS.INSTANCE_ID);
    this.metaId = this._getString(IdentifierDataSource.KEYS.META_ID);
    this.operation = this._getString(IdentifierDataSource.KEYS.OPERATION);
    this.status = this._getValue(IdentifierDataSource.KEYS.STATUS) as Status;
    this.toBeDelete = this._getString(IdentifierDataSource.KEYS.TO_BE_DELETE);
    this.type = this._getString(IdentifierDataSource.KEYS.TYPE);
    this.uid = this._getString(IdentifierDataSource.KEYS.UID);
    this.version = this._getString(IdentifierDataSource.KEYS.VERSION);
    this.versionId = this._getString(IdentifierDataSource.KEYS.VERSION_ID);
  }
}
