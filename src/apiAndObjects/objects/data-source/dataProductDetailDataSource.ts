import { Status } from 'src/utility/enums/status.enum';
import { BaseObject } from '../../_lib_code/objects/baseObject';
import { LinkedEntity, DataProduct as DataProductType } from 'generated/backofficeSchemas';
export class DataProductDetailDataSource extends BaseObject implements DataProductType {
  public static readonly KEYS = {
    INSTANCE_ID: 'instanceId',
    META_ID: 'metaId',
    INSTANCE_CHANGE_ID: 'instanceChangedId',
    CHANGE_TIMESTAMP: 'changeTimestamp',
    OPERATION: 'operation',
    EDITOR_ID: 'editorId',
    CHANGE_COMMENT: 'changeComment',
    VERSION: 'version',
    STATUS: 'status',
    TO_BE_DELETE: 'toBeDelete',
    UID: 'uid',
    FILE_PROVENANCE: 'fileProvenance',
    ACCESS_RIGHT: 'accessRight',
    ACCRUAL_PERIODICITY: 'accrualPeriodicity',
    CATEGORY: 'category',
    CONTACT_POINT: 'contactPoint',
    CREATED: 'created',
    DESCRIPTION: 'description',
    DISTRIBUTION: 'distribution',
    HAS_PART: 'hasPart',
    IDENTIFIER: 'identifier',
    IS_PART_OF: 'isPartOf',
    ISSUED: 'issued',
    KEYWORDS: 'keywords',
    MODIFIED: 'modified',
    PROVENANCE: 'provenance',
    PUBLISHER: 'publisher',
    RELATION: 'relation',
    SPATIAL_EXTENT: 'spatialExtent',
    TEMPORAL_EXTENT: 'temporalExtent',
    TITLE: 'title',
    TYPE: 'type',
    VERSION_INFO: 'versionInfo',
    DOCUMENTATION: 'documentation',
    QUALITY_ASSURANCE: 'qualityAssurance',
    HAS_QUALITY_ANNOTATION: 'hasQualityAnnotation',
    GROUPS: 'groups',
    VARIABLE_MEASURED: 'variableMeasured',
    VERSION_ID: 'versionId',
  };

  public readonly accessRight: string;
  public readonly accrualPeriodicity: string;
  public readonly category: Array<LinkedEntity>;
  public readonly changeComment: string;
  public readonly changeTimestamp: string;
  public readonly contactPoint: Array<LinkedEntity>;
  public readonly created: string;
  public readonly description: Array<string>;
  public readonly distribution: Array<LinkedEntity>;
  public readonly documentation: string;
  public readonly editorId: string;
  public readonly fileProvenance: string;
  public readonly groups: Array<string>;
  public readonly hasPart: Array<LinkedEntity>;
  public readonly identifier: Array<LinkedEntity>;
  public readonly hasQualityAnnotation: string;
  public readonly instanceChangedId: string;
  public readonly instanceId: string;
  public readonly isPartOf: Array<LinkedEntity>;
  public readonly issued: string;
  public readonly keywords: string;
  public readonly metaId: string;
  public readonly modified: string;
  public readonly operation: string;
  public readonly provenance: Array<string>;
  public readonly publisher: Array<LinkedEntity>;
  public readonly qualityAssurance: string;
  public readonly relation: Array<LinkedEntity>;
  public readonly spatialExtent: Array<LinkedEntity>;
  public readonly status: Status;
  public readonly temporalExtent: Array<LinkedEntity>;
  public readonly title: Array<string>;
  public readonly toBeDelete: string;
  public readonly type: string;
  public readonly uid: string;
  public readonly version: string;
  public readonly versionId: string;
  public readonly versionInfo: string;
  public readonly variableMeasured: Array<string>;

  protected constructor(sourceObject?: Record<string, unknown>) {
    super(sourceObject);

    this.instanceId = this._getString(DataProductDetailDataSource.KEYS.INSTANCE_ID);
    this.metaId = this._getString(DataProductDetailDataSource.KEYS.META_ID);
    this.instanceChangedId = this._getString(DataProductDetailDataSource.KEYS.INSTANCE_CHANGE_ID);
    this.changeTimestamp = this._getString(DataProductDetailDataSource.KEYS.CHANGE_TIMESTAMP);
    this.operation = this._getString(DataProductDetailDataSource.KEYS.OPERATION);
    this.editorId = this._getString(DataProductDetailDataSource.KEYS.EDITOR_ID);
    this.changeComment = this._getString(DataProductDetailDataSource.KEYS.CHANGE_COMMENT);
    this.version = this._getString(DataProductDetailDataSource.KEYS.VERSION);
    this.versionId = this._getString(DataProductDetailDataSource.KEYS.VERSION_ID);
    this.status = this._getValue(DataProductDetailDataSource.KEYS.STATUS) as Status;
    this.toBeDelete = this._getString(DataProductDetailDataSource.KEYS.TO_BE_DELETE);
    this.uid = this._getString(DataProductDetailDataSource.KEYS.UID);
    this.fileProvenance = this._getString(DataProductDetailDataSource.KEYS.FILE_PROVENANCE);
    this.accessRight = this._getString(DataProductDetailDataSource.KEYS.ACCESS_RIGHT);
    this.accrualPeriodicity = this._getString(DataProductDetailDataSource.KEYS.ACCRUAL_PERIODICITY);
    this.category = this._getArray(DataProductDetailDataSource.KEYS.CATEGORY);
    this.contactPoint = this._getArray(DataProductDetailDataSource.KEYS.CONTACT_POINT);
    this.created = this._getString(DataProductDetailDataSource.KEYS.CREATED);
    this.description = this._getArray(DataProductDetailDataSource.KEYS.DESCRIPTION);
    this.distribution = this._getArray(DataProductDetailDataSource.KEYS.DISTRIBUTION);
    this.hasPart = this._getArray(DataProductDetailDataSource.KEYS.HAS_PART);
    this.identifier = this._getArray(DataProductDetailDataSource.KEYS.IDENTIFIER);
    this.isPartOf = this._getArray(DataProductDetailDataSource.KEYS.IS_PART_OF);
    this.issued = this._getString(DataProductDetailDataSource.KEYS.ISSUED);
    this.keywords = this._getString(DataProductDetailDataSource.KEYS.KEYWORDS);
    this.modified = this._getString(DataProductDetailDataSource.KEYS.MODIFIED);
    this.provenance = this._getArray(DataProductDetailDataSource.KEYS.PROVENANCE);
    this.publisher = this._getArray(DataProductDetailDataSource.KEYS.PUBLISHER);
    this.relation = this._getArray(DataProductDetailDataSource.KEYS.RELATION);
    this.spatialExtent = this._getArray(DataProductDetailDataSource.KEYS.SPATIAL_EXTENT);
    this.temporalExtent = this._getArray(DataProductDetailDataSource.KEYS.TEMPORAL_EXTENT);
    this.title = this._getArray(DataProductDetailDataSource.KEYS.TITLE);
    this.type = this._getString(DataProductDetailDataSource.KEYS.TYPE);
    this.versionInfo = this._getString(DataProductDetailDataSource.KEYS.VERSION_INFO);
    this.documentation = this._getString(DataProductDetailDataSource.KEYS.DOCUMENTATION);
    this.qualityAssurance = this._getString(DataProductDetailDataSource.KEYS.QUALITY_ASSURANCE);
    this.hasQualityAnnotation = this._getString(DataProductDetailDataSource.KEYS.HAS_QUALITY_ANNOTATION);
    this.groups = this._getArray(DataProductDetailDataSource.KEYS.GROUPS);
    this.variableMeasured = this._getArray(DataProductDetailDataSource.KEYS.VARIABLE_MEASURED);
  }
}
