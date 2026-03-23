import { Category as CategoryType, LinkedEntity } from 'generated/backofficeSchemas';
import { BaseObject } from 'src/apiAndObjects/_lib_code/objects/baseObject';
import { Status } from 'src/utility/enums/status.enum';

export class CategoryDataSource extends BaseObject implements CategoryType {
  public static readonly KEYS = {
    BROADER: 'broader',
    CHANGE_COMMENT: 'changeComment',
    CHANGE_TIMESTAMP: 'changeTimestamp',
    DESCRIPTION: 'description',
    EDITOR_ID: 'editorId',
    FILE_PROVENANCE: 'fileProvenance',
    GROUPS: 'groups',
    INSCHEME: 'inScheme',
    INSTANCE_CHANGED_ID: 'instanceChangedId',
    INSTANCE_ID: 'instanceId',
    META_ID: 'metaId',
    NAME: 'name',
    NARROWER: 'narrower',
    OPERATION: 'operation',
    STATUS: 'status',
    TO_BE_DELETE: 'toBeDelete',
    UID: 'uid',
    VERSION: 'version',
    VERSION_ID: 'versionId',
  };

  public readonly broader: LinkedEntity[];
  public readonly changeComment: string;
  public readonly changeTimestamp: string;
  public readonly description: string;
  public readonly editorId: string;
  public readonly fileProvenance: string;
  public readonly groups: string[];
  public readonly inScheme: LinkedEntity;
  public readonly instanceChangedId: string;
  public readonly instanceId: string;
  public readonly metaId: string;
  public readonly name: string;
  public readonly narrower: LinkedEntity[];
  public readonly operation: string;
  public readonly status: Status;
  public readonly toBeDelete: string;
  public readonly uid: string;
  public readonly version: string;
  public readonly versionId: string;

  protected constructor(sourceObject?: Record<string, unknown>) {
    super(sourceObject);
    this.broader = this._getArray(CategoryDataSource.KEYS.BROADER);
    this.changeComment = this._getString(CategoryDataSource.KEYS.CHANGE_COMMENT);
    this.changeTimestamp = this._getString(CategoryDataSource.KEYS.CHANGE_TIMESTAMP);
    this.description = this._getString(CategoryDataSource.KEYS.DESCRIPTION);
    this.editorId = this._getString(CategoryDataSource.KEYS.EDITOR_ID);
    this.fileProvenance = this._getString(CategoryDataSource.KEYS.FILE_PROVENANCE);
    this.groups = this._getArray(CategoryDataSource.KEYS.GROUPS);
    this.inScheme = this._getValue(CategoryDataSource.KEYS.INSCHEME) as LinkedEntity;
    this.instanceChangedId = this._getString(CategoryDataSource.KEYS.INSTANCE_CHANGED_ID);
    this.instanceId = this._getString(CategoryDataSource.KEYS.INSTANCE_ID);
    this.metaId = this._getString(CategoryDataSource.KEYS.META_ID);
    this.name = this._getString(CategoryDataSource.KEYS.NAME);
    this.narrower = this._getArray(CategoryDataSource.KEYS.NARROWER);
    this.operation = this._getString(CategoryDataSource.KEYS.OPERATION);
    this.status = this._getValue(CategoryDataSource.KEYS.STATUS) as Status;
    this.toBeDelete = this._getString(CategoryDataSource.KEYS.TO_BE_DELETE);
    this.uid = this._getString(CategoryDataSource.KEYS.UID);
    this.version = this._getString(CategoryDataSource.KEYS.VERSION);
    this.versionId = this._getString(CategoryDataSource.KEYS.VERSION_ID);
  }
}
