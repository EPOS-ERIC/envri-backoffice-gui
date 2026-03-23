import { Mapping } from 'generated/backofficeSchemas';
import { BaseObject } from 'src/apiAndObjects/_lib_code/objects/baseObject';
import { Status } from 'src/utility/enums/status.enum';

export class MappingDataSource extends BaseObject implements Mapping {
  public static readonly KEYS = {
    CHANGE_COMMENT: 'changeComment',
    CHANGE_TIMESTAMP: 'changeTimestamp',
    DEFAULT_VALUE: 'defaultValue',
    EDITOR_ID: 'editorId',
    FILE_PROVENANCE: 'fileProvenance',
    GROUPS: 'groups',
    INSTANCE_CHANGED_ID: 'instanceChangedId',
    INSTANCE_ID: 'instanceId',
    LABEL: 'label',
    MAX_VALUE: 'maxValue',
    META_ID: 'metaId',
    MIN_VALUE: 'minValue',
    MULTIPLE_VALUES: 'multipleValues',
    OPERATION: 'operation',
    PARAM_VALUE: 'paramValue',
    PROPERTY: 'property',
    RANGE: 'range',
    READ_ONLY_VALUE: 'readOnlyValue',
    REQUIRED: 'required',
    STATUS: 'status',
    TO_BE_DELETE: 'toBeDelete',
    UID: 'uid',
    VALUE_PATTERN: 'valuePattern',
    VARIABLE: 'variable',
    VERSION: 'version',
    VERSION_ID: 'versionId',
  };

  public readonly changeComment: string;
  public readonly changeTimestamp: string;
  public readonly defaultValue: string;
  public readonly editorId: string;
  public readonly fileProvenance: string;
  public readonly groups: string[];
  public readonly instanceChangedId: string;
  public readonly instanceId: string;
  public readonly label: string;
  public readonly maxValue: string;
  public readonly metaId: string;
  public readonly minValue: string;
  public readonly multipleValues: string;
  public readonly operation: string;
  public readonly paramValue: string[];
  public readonly property: string;
  public readonly range: string;
  public readonly readOnlyValue: string;
  public readonly required: string;
  public readonly status: Status;
  public readonly toBeDelete: string;
  public readonly uid: string;
  public readonly valuePattern: string;
  public readonly variable: string;
  public readonly version: string;
  public readonly versionId: string;

  protected constructor(sourceObject?: Record<string, unknown>) {
    super(sourceObject);

    this.changeComment = this._getString(MappingDataSource.KEYS.CHANGE_COMMENT);
    this.changeTimestamp = this._getString(MappingDataSource.KEYS.CHANGE_TIMESTAMP);
    this.defaultValue = this._getString(MappingDataSource.KEYS.DEFAULT_VALUE);
    this.editorId = this._getString(MappingDataSource.KEYS.EDITOR_ID);
    this.fileProvenance = this._getString(MappingDataSource.KEYS.FILE_PROVENANCE);
    this.groups = this._getArray(MappingDataSource.KEYS.GROUPS);
    this.instanceChangedId = this._getString(MappingDataSource.KEYS.INSTANCE_CHANGED_ID);
    this.instanceId = this._getString(MappingDataSource.KEYS.INSTANCE_ID);
    this.label = this._getString(MappingDataSource.KEYS.LABEL);
    this.maxValue = this._getString(MappingDataSource.KEYS.MAX_VALUE);
    this.metaId = this._getString(MappingDataSource.KEYS.META_ID);
    this.minValue = this._getString(MappingDataSource.KEYS.MIN_VALUE);
    this.multipleValues = this._getString(MappingDataSource.KEYS.MULTIPLE_VALUES);
    this.operation = this._getString(MappingDataSource.KEYS.OPERATION);
    this.paramValue = this._getArray(MappingDataSource.KEYS.PARAM_VALUE);
    this.property = this._getString(MappingDataSource.KEYS.PROPERTY);
    this.range = this._getString(MappingDataSource.KEYS.RANGE);
    this.readOnlyValue = this._getString(MappingDataSource.KEYS.READ_ONLY_VALUE);
    this.required = this._getString(MappingDataSource.KEYS.REQUIRED);
    this.status = this._getValue(MappingDataSource.KEYS.STATUS) as Status;
    this.toBeDelete = this._getString(MappingDataSource.KEYS.TO_BE_DELETE);
    this.uid = this._getString(MappingDataSource.KEYS.UID);
    this.valuePattern = this._getString(MappingDataSource.KEYS.VALUE_PATTERN);
    this.variable = this._getString(MappingDataSource.KEYS.VARIABLE);
    this.version = this._getString(MappingDataSource.KEYS.VERSION);
    this.versionId = this._getString(MappingDataSource.KEYS.VERSION_ID);
  }
}
