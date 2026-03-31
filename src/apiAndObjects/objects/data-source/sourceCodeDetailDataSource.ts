import { BaseObject } from 'src/apiAndObjects/_lib_code/objects/baseObject';
import { LinkedEntity, SoftwareSourceCode } from 'generated/backofficeSchemas';
import { Status } from 'src/utility/enums/status.enum';

export class SourceCodeDetailDataSource extends BaseObject implements SoftwareSourceCode {
  public static readonly KEYS = {
    author: 'author',
    category: 'category',
    changeComment: 'changeComment',
    changeTimestamp: 'changeTimestamp',
    citation: 'citation',
    codeRepository: 'codeRepository',
    contactPoint: 'contactPoint',
    contributor: 'contributor',
    creator: 'creator',
    description: 'description',
    downloadURL: 'downloadURL',
    editorId: 'editorId',
    fileProvenance: 'fileProvenance',
    funder: 'funder',
    groups: 'groups',
    identifier: 'identifier',
    instanceChangedId: 'instanceChangedId',
    instanceId: 'instanceId',
    keywords: 'keywords',
    licenseURL: 'licenseURL',
    mainEntityofPage: 'mainEntityofPage',
    maintainer: 'maintainer',
    metaId: 'metaId',
    name: 'name',
    operation: 'operation',
    programmingLanguage: 'programmingLanguage',
    provider: 'provider',
    publisher: 'publisher',
    relation: 'relation',
    runtimePlatform: 'runtimePlatform',
    size: 'size',
    softwareRequirements: 'softwareRequirements',
    softwareStatus: 'softwareStatus',
    softwareVersion: 'softwareVersion',
    spatial: 'spatial',
    status: 'status',
    temporal: 'temporal',
    timeRequired: 'timeRequired',
    toBeDelete: 'toBeDelete',
    uid: 'uid',
    version: 'version',
    versionId: 'versionId',
  };

  public readonly author?: LinkedEntity[] | undefined;
  public readonly category?: LinkedEntity[] | undefined;
  public readonly changeComment?: string | undefined;
  public readonly changeTimestamp?: string | undefined;
  public readonly citation?: string[] | undefined;
  public readonly codeRepository?: string | undefined;
  public readonly contactPoint?: LinkedEntity[] | undefined;
  public readonly contributor?: LinkedEntity[] | undefined;
  public readonly creator?: LinkedEntity[] | undefined;
  public readonly description?: string | undefined;
  public readonly downloadURL?: string | undefined;
  public readonly editorId?: string | undefined;
  public readonly fileProvenance?: string | undefined;
  public readonly funder?: LinkedEntity[] | undefined;
  public readonly groups?: string[] | undefined;
  public readonly identifier?: LinkedEntity[] | undefined;
  public readonly instanceChangedId?: string | undefined;
  public readonly instanceId?: string | undefined;
  public readonly keywords?: string | undefined;
  public readonly licenseURL?: string | undefined;
  public readonly mainEntityofPage?: string | undefined;
  public readonly maintainer?: LinkedEntity[] | undefined;
  public readonly metaId?: string | undefined;
  public readonly name?: string | undefined;
  public readonly operation?: string | undefined;
  public readonly programmingLanguage?: string[] | undefined;
  public readonly provider?: LinkedEntity[] | undefined;
  public readonly publisher?: LinkedEntity[] | undefined;
  public readonly relation?: LinkedEntity[] | undefined;
  public readonly runtimePlatform?: string | undefined;
  public readonly size?: string | undefined;
  public readonly softwareRequirements?: string | undefined;
  public readonly softwareStatus?: string | undefined;
  public readonly softwareVersion?: string | undefined;
  public readonly spatial?: string | undefined;
  public readonly status?: 'ARCHIVED' | 'DISCARDED' | 'DRAFT' | 'SUBMITTED' | 'PUBLISHED' | 'PENDING' | undefined;
  public readonly temporal?: string | undefined;
  public readonly timeRequired?: string | undefined;
  public readonly toBeDelete?: string | undefined;
  public readonly uid?: string | undefined;
  public readonly version?: string | undefined;
  public readonly versionId?: string | undefined;

  protected constructor(sourceObject?: Record<string, unknown>) {
    super(sourceObject);
    this.instanceId = this._getString(SourceCodeDetailDataSource.KEYS.instanceId);
    this.identifier = this._getArray(SourceCodeDetailDataSource.KEYS.identifier);
    this.category = this._getArray(SourceCodeDetailDataSource.KEYS.category);
    this.changeTimestamp = this._getString(SourceCodeDetailDataSource.KEYS.changeTimestamp);
    this.codeRepository = this._getString(SourceCodeDetailDataSource.KEYS.codeRepository);
    this.fileProvenance = this._getString(SourceCodeDetailDataSource.KEYS.fileProvenance);
    this.contactPoint = this._getArray(SourceCodeDetailDataSource.KEYS.contactPoint);
    this.description = this._getString(SourceCodeDetailDataSource.KEYS.description);
    this.downloadURL = this._getValue(SourceCodeDetailDataSource.KEYS.downloadURL) as string;
    this.name = this._getString(SourceCodeDetailDataSource.KEYS.name);
    this.metaId = this._getString(SourceCodeDetailDataSource.KEYS.metaId);
    this.editorId = this._getString(SourceCodeDetailDataSource.KEYS.editorId);
    this.changeComment = this._getString(SourceCodeDetailDataSource.KEYS.changeComment);
    this.groups = this._getArray(SourceCodeDetailDataSource.KEYS.groups);
    this.licenseURL = this._getString(SourceCodeDetailDataSource.KEYS.licenseURL);
    this.mainEntityofPage = this._getString(SourceCodeDetailDataSource.KEYS.mainEntityofPage);
    this.keywords = this._getString(SourceCodeDetailDataSource.KEYS.keywords);
    this.instanceChangedId = this._getString(SourceCodeDetailDataSource.KEYS.instanceChangedId);
    this.operation = this._getString(SourceCodeDetailDataSource.KEYS.operation);
    this.programmingLanguage = this._getArray(SourceCodeDetailDataSource.KEYS.programmingLanguage);
    this.provider = this._getArray(SourceCodeDetailDataSource.KEYS.provider);
    this.publisher = this._getArray(SourceCodeDetailDataSource.KEYS.publisher);
    this.relation = this._getArray(SourceCodeDetailDataSource.KEYS.relation);
    this.runtimePlatform = this._getString(SourceCodeDetailDataSource.KEYS.runtimePlatform);
    this.size = this._getString(SourceCodeDetailDataSource.KEYS.size);
    this.softwareRequirements = this._getString(SourceCodeDetailDataSource.KEYS.softwareRequirements);
    this.softwareStatus = this._getString(SourceCodeDetailDataSource.KEYS.softwareStatus);
    this.softwareVersion = this._getString(SourceCodeDetailDataSource.KEYS.softwareVersion);
    this.spatial = this._getString(SourceCodeDetailDataSource.KEYS.spatial);
    this.status = this._getValue(SourceCodeDetailDataSource.KEYS.status) as Status;
    this.temporal = this._getString(SourceCodeDetailDataSource.KEYS.temporal);
    this.timeRequired = this._getString(SourceCodeDetailDataSource.KEYS.timeRequired);
    this.toBeDelete = this._getString(SourceCodeDetailDataSource.KEYS.toBeDelete);
    this.uid = this._getString(SourceCodeDetailDataSource.KEYS.uid);
    this.version = this._getString(SourceCodeDetailDataSource.KEYS.version);
    this.versionId = this._getString(SourceCodeDetailDataSource.KEYS.versionId);
    this.creator = this._getArray(SourceCodeDetailDataSource.KEYS.creator);
  }
}
