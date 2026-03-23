import { LinkedEntity, ContactPoint as ContactPointType } from 'generated/backofficeSchemas';
import { Status } from 'src/utility/enums/status.enum';
import { BaseObject } from '../../_lib_code/objects/baseObject';

export class ContactPointDetailDataSource extends BaseObject implements ContactPointType {
  public static readonly KEYS = {
    CHANGE_COMMENT: 'changeComment',
    CHANGE_TIMESTAMP: 'changeTimestamp',
    EDITOR_ID: 'editorId',
    EMAIL: 'email',
    FILE_PROVENANCE: 'fileProvenance',
    GROUPS: 'groups',
    INSTANCE_CHANGED_ID: 'instanceChangedId',
    INSTANCE_ID: 'instanceId',
    LANGUAGE: 'language',
    META_ID: 'metaId',
    OPERATION: 'operation',
    ORGANIZATION: 'organization',
    PERSON: 'person',
    ROLE: 'role',
    STATUS: 'status',
    TELEPHONE: 'telephone',
    TO_BE_DELETE: 'toBeDelete',
    UID: 'uid',
    VERSION: 'version',
    VERSION_ID: 'versionId',
  };

  public readonly changeComment: string;
  public readonly changeTimestamp: string;
  public readonly editorId: string;
  public readonly email: Array<string>;
  public readonly fileProvenance: string;
  public readonly groups: Array<string>;
  public readonly instanceChangedId: string;
  public readonly instanceId: string;
  public readonly language: Array<string>;
  public readonly metaId: string;
  public readonly operation: string;
  public readonly organization: LinkedEntity;
  public readonly person: LinkedEntity;
  public readonly role: string;
  public readonly status: Status;
  public readonly telephone: Array<string>;
  public readonly toBeDelete: string;
  public readonly uid: string;
  public readonly version: string;
  public readonly versionId: string;

  protected constructor(sourceObject?: Record<string, unknown>) {
    super(sourceObject);

    this.instanceId = this._getString(ContactPointDetailDataSource.KEYS.INSTANCE_ID);
    this.changeTimestamp = this._getString(ContactPointDetailDataSource.KEYS.CHANGE_TIMESTAMP);
    this.editorId = this._getString(ContactPointDetailDataSource.KEYS.EDITOR_ID);
    this.status = this._getValue(ContactPointDetailDataSource.KEYS.STATUS) as Status;
    this.toBeDelete = this._getString(ContactPointDetailDataSource.KEYS.TO_BE_DELETE);
    this.fileProvenance = this._getString(ContactPointDetailDataSource.KEYS.FILE_PROVENANCE);
    this.email = this._getArray(ContactPointDetailDataSource.KEYS.EMAIL);
    this.language = this._getArray(ContactPointDetailDataSource.KEYS.LANGUAGE);
    this.organization = this._getValue(ContactPointDetailDataSource.KEYS.ORGANIZATION) as LinkedEntity;
    this.role = this._getString(ContactPointDetailDataSource.KEYS.ROLE);
    this.person = this._getValue(ContactPointDetailDataSource.KEYS.PERSON) as LinkedEntity;
    this.telephone = this._getArray(ContactPointDetailDataSource.KEYS.TELEPHONE);
    this.metaId = this._getString(ContactPointDetailDataSource.KEYS.META_ID);
    this.uid = this._getString(ContactPointDetailDataSource.KEYS.UID);
    this.changeComment = this._getString(ContactPointDetailDataSource.KEYS.CHANGE_COMMENT);
    this.groups = this._getArray(ContactPointDetailDataSource.KEYS.GROUPS);
    this.instanceChangedId = this._getString(ContactPointDetailDataSource.KEYS.INSTANCE_CHANGED_ID);
    this.operation = this._getString(ContactPointDetailDataSource.KEYS.OPERATION);
    this.version = this._getString(ContactPointDetailDataSource.KEYS.VERSION);
    this.versionId = this._getString(ContactPointDetailDataSource.KEYS.VERSION_ID);
  }
}
