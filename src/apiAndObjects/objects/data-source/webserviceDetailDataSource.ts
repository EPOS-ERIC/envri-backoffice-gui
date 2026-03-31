import { BaseObject } from 'src/apiAndObjects/_lib_code/objects/baseObject';
import { DataProduct, LinkedEntity, WebService as WebServiceType } from 'generated/backofficeSchemas';

export class WebserviceDetailDataSource extends BaseObject implements WebServiceType {
  public static readonly KEYS = {
    AAAI_TYPES: 'aaaiTypes',
    CATEGORY: 'category',
    CHANGE_COMMENT: 'changeComment',
    CHANGE_TIMESTAMP: 'changeTimestamp',
    CONTACT_POINT: 'contactPoint',
    DATE_MODIFIED: 'dateModified',
    DATE_PUBLISHED: 'datePublished',
    DESCRIPTION: 'description',
    DISTRIBUTION: 'distribution',
    DOCUMENTATION: 'documentation',
    EDITOR_ID: 'editorId',
    ENTRY_POINT: 'entryPoint',
    FILE_PROVENANCE: 'fileProvenance',
    GROUPS: 'groups',
    IDENTIFIER: 'identifier',
    INSTANCE_CHANGED_ID: 'instanceChangedId',
    INSTANCE_ID: 'instanceId',
    KEYWORDS: 'keywords',
    LICENSE: 'license',
    META_ID: 'metaId',
    NAME: 'name',
    OPERATION: 'operation',
    PROVIDER: 'provider',
    RELATION: 'relation',
    SPATIAL_EXTENT: 'spatialExtent',
    STATUS: 'status',
    SUPPORTED_OPERATION: 'supportedOperation',
    TEMPORAL_EXTENT: 'temporalExtent',
    TO_BE_DELETE: 'toBeDelete',
    UID: 'uid',
    VERSION: 'version',
    VERSION_ID: 'versionId',
  };

  public readonly aaaiTypes: string;
  public readonly category: Array<LinkedEntity>;
  public readonly changeComment: string;
  public readonly changeTimestamp: string;
  public readonly contactPoint: Array<LinkedEntity>;
  public readonly dateModified: string;
  public readonly datePublished: string;
  public readonly description: string;
  public readonly distribution: Array<LinkedEntity>;
  public readonly documentation: Array<LinkedEntity>;
  public readonly editorId: string;
  public readonly entryPoint: string;
  public readonly fileProvenance: string;
  public readonly groups: string[];
  public readonly identifier: Array<LinkedEntity>;
  public readonly instanceChangedId: string;
  public readonly instanceId: string;
  public readonly keywords: string;
  public readonly license: string;
  public readonly metaId: string;
  public readonly name: string;
  public readonly operation: string;
  public readonly provider: LinkedEntity;
  public readonly relation: Array<LinkedEntity>;
  public readonly spatialExtent: Array<LinkedEntity>;
  public readonly status: DataProduct['status'];
  public readonly supportedOperation: Array<LinkedEntity>;
  public readonly temporalExtent: Array<LinkedEntity>;
  public readonly toBeDelete: string;
  public readonly uid: string;
  public readonly version: string;
  public readonly versionId: string;

  protected constructor(sourceObject?: Record<string, unknown>) {
    super(sourceObject);

    this.aaaiTypes = this._getString(WebserviceDetailDataSource.KEYS.AAAI_TYPES);
    this.category = this._getArray(WebserviceDetailDataSource.KEYS.CATEGORY);
    this.changeComment = this._getString(WebserviceDetailDataSource.KEYS.CHANGE_COMMENT);
    this.changeTimestamp = this._getString(WebserviceDetailDataSource.KEYS.CHANGE_TIMESTAMP);
    this.contactPoint = this._getArray(WebserviceDetailDataSource.KEYS.CONTACT_POINT);
    this.dateModified = this._getString(WebserviceDetailDataSource.KEYS.DATE_MODIFIED);
    this.datePublished = this._getString(WebserviceDetailDataSource.KEYS.DATE_PUBLISHED);
    this.description = this._getString(WebserviceDetailDataSource.KEYS.DESCRIPTION);
    this.distribution = this._getArray(WebserviceDetailDataSource.KEYS.DISTRIBUTION);
    this.documentation = this._getArray(WebserviceDetailDataSource.KEYS.DOCUMENTATION);
    this.editorId = this._getString(WebserviceDetailDataSource.KEYS.EDITOR_ID);
    this.entryPoint = this._getString(WebserviceDetailDataSource.KEYS.ENTRY_POINT);
    this.fileProvenance = this._getString(WebserviceDetailDataSource.KEYS.FILE_PROVENANCE);
    this.groups = this._getArray(WebserviceDetailDataSource.KEYS.GROUPS);
    this.identifier = this._getArray(WebserviceDetailDataSource.KEYS.IDENTIFIER);
    this.instanceChangedId = this._getString(WebserviceDetailDataSource.KEYS.INSTANCE_CHANGED_ID);
    this.instanceId = this._getString(WebserviceDetailDataSource.KEYS.INSTANCE_ID);
    this.keywords = this._getString(WebserviceDetailDataSource.KEYS.KEYWORDS);
    this.license = this._getString(WebserviceDetailDataSource.KEYS.LICENSE);
    this.metaId = this._getString(WebserviceDetailDataSource.KEYS.META_ID);
    this.name = this._getString(WebserviceDetailDataSource.KEYS.NAME);
    this.operation = this._getString(WebserviceDetailDataSource.KEYS.OPERATION);
    this.provider = this._getValue(WebserviceDetailDataSource.KEYS.PROVIDER) as LinkedEntity;
    this.relation = this._getArray(WebserviceDetailDataSource.KEYS.RELATION);
    this.spatialExtent = this._getArray(WebserviceDetailDataSource.KEYS.SPATIAL_EXTENT);
    this.status = this._getValue(WebserviceDetailDataSource.KEYS.STATUS) as DataProduct['status'];
    this.supportedOperation = this._getArray(WebserviceDetailDataSource.KEYS.SUPPORTED_OPERATION);
    this.temporalExtent = this._getArray(WebserviceDetailDataSource.KEYS.TEMPORAL_EXTENT);
    this.toBeDelete = this._getString(WebserviceDetailDataSource.KEYS.TO_BE_DELETE);
    this.uid = this._getString(WebserviceDetailDataSource.KEYS.UID);
    this.version = this._getString(WebserviceDetailDataSource.KEYS.VERSION);
    this.versionId = this._getString(WebserviceDetailDataSource.KEYS.VERSION_ID);
  }
}
