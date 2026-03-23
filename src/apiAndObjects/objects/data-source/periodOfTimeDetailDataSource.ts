import { PeriodOfTime } from 'generated/backofficeSchemas';
import { BaseObject } from 'src/apiAndObjects/_lib_code/objects/baseObject';
import { Status } from 'src/utility/enums/status.enum';

export class PeriodOfTimeDataSource extends BaseObject implements PeriodOfTime {
  public static readonly KEYS = {
    CHANGE_COMMENT: 'changeComment',
    CHANGE_TIMESTAMP: 'changeTimestamp',
    EDITOR_ID: 'editorId',
    END_DATE: 'endDate',
    FILE_PROVENANCE: 'fileProvenance',
    GROUPS: 'groups',
    INSTANCE_CHANGED_ID: 'instanceChangedId',
    INSTANCE_ID: 'instanceId',
    META_ID: 'metaId',
    OPERATION: 'operation',
    START_DATE: 'startDate',
    STATUS: 'status',
    TO_BE_DELETE: 'toBeDelete',
    UID: 'uid',
    VERSION: 'version',
    VERSION_ID: 'versionId',
  };

  public readonly changeComment: string;
  public readonly changeTimestamp: string;
  public readonly editorId: string;
  public readonly endDate: string;
  public readonly fileProvenance: string;
  public readonly groups: string[];
  public readonly instanceChangedId: string;
  public readonly instanceId: string;
  public readonly metaId: string;
  public readonly operation: string;
  public readonly startDate: string;
  public readonly status: Status;
  public readonly toBeDelete: string;
  public readonly uid: string;
  public readonly version: string;
  public readonly versionId: string;

  protected constructor(sourceObject?: Record<string, unknown>) {
    super(sourceObject);
    this.changeComment = this._getString(PeriodOfTimeDataSource.KEYS.CHANGE_COMMENT);
    this.changeTimestamp = this._getString(PeriodOfTimeDataSource.KEYS.CHANGE_TIMESTAMP);
    this.editorId = this._getString(PeriodOfTimeDataSource.KEYS.EDITOR_ID);
    this.endDate = this._getString(PeriodOfTimeDataSource.KEYS.END_DATE);
    this.fileProvenance = this._getString(PeriodOfTimeDataSource.KEYS.FILE_PROVENANCE);
    this.groups = this._getArray(PeriodOfTimeDataSource.KEYS.GROUPS);
    this.instanceChangedId = this._getString(PeriodOfTimeDataSource.KEYS.INSTANCE_CHANGED_ID);
    this.instanceId = this._getString(PeriodOfTimeDataSource.KEYS.INSTANCE_ID);
    this.metaId = this._getString(PeriodOfTimeDataSource.KEYS.META_ID);
    this.operation = this._getString(PeriodOfTimeDataSource.KEYS.OPERATION);
    this.startDate = this._getString(PeriodOfTimeDataSource.KEYS.START_DATE);
    this.status = this._getValue(PeriodOfTimeDataSource.KEYS.STATUS) as Status;
    this.toBeDelete = this._getString(PeriodOfTimeDataSource.KEYS.TO_BE_DELETE);
    this.uid = this._getString(PeriodOfTimeDataSource.KEYS.UID);
    this.version = this._getString(PeriodOfTimeDataSource.KEYS.VERSION);
    this.versionId = this._getString(PeriodOfTimeDataSource.KEYS.VERSION_ID);
  }
}
