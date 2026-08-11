import { Address as AddressType } from 'generated/backofficeSchemas';
import { BaseObject } from 'src/apiAndObjects/_lib_code/objects/baseObject';

export class AddressDataSource extends BaseObject implements AddressType {
  public static readonly KEYS = {
    CHANGE_COMMENT: 'changeComment',
    CHANGE_TIMESTAMP: 'changeTimestamp',
    COUNTRY: 'country',
    COUNTRY_CODE: 'countryCode',
    EDITOR_ID: 'editorId',
    FILE_PROVENANCE: 'fileProvenance',
    GROUPS: 'groups',
    INSTANCE_CHANGED_ID: 'instanceChangedId',
    INSTANCE_ID: 'instanceId',
    LOCALITY: 'locality',
    META_ID: 'metaId',
    OPERATION: 'operation',
    POSTAL_CODE: 'postalCode',
    STATUS: 'status',
    STREET: 'street',
    TO_BE_DELETE: 'toBeDelete',
    UID: 'uid',
    VERSION: 'version',
    VERSION_ID: 'versionId',
  };

  public readonly changeComment: string;
  public readonly changeTimestamp: string;
  public readonly country: string;
  public readonly countryCode: string;
  public readonly editorId: string;
  public readonly fileProvenance: string;
  public readonly groups: string[];
  public readonly instanceChangedId: string;
  public readonly instanceId: string;
  public readonly locality: string;
  public readonly metaId: string;
  public readonly operation: string;
  public readonly postalCode: string;
  public readonly status: AddressType['status'];
  public readonly street: string;
  public readonly toBeDelete: string;
  public readonly uid: string;
  public readonly version: string;
  public readonly versionId: string;

  protected constructor(sourceObject?: Record<string, unknown>) {
    super(sourceObject);
    this.changeComment = this._getString(AddressDataSource.KEYS.CHANGE_COMMENT);
    this.changeTimestamp = this._getString(AddressDataSource.KEYS.CHANGE_TIMESTAMP);
    this.country = this._getString(AddressDataSource.KEYS.COUNTRY);
    this.countryCode = this._getString(AddressDataSource.KEYS.COUNTRY_CODE);
    this.editorId = this._getString(AddressDataSource.KEYS.EDITOR_ID);
    this.fileProvenance = this._getString(AddressDataSource.KEYS.FILE_PROVENANCE);
    this.groups = this._getArray(AddressDataSource.KEYS.GROUPS);
    this.instanceChangedId = this._getString(AddressDataSource.KEYS.INSTANCE_CHANGED_ID);
    this.instanceId = this._getString(AddressDataSource.KEYS.INSTANCE_ID);
    this.locality = this._getString(AddressDataSource.KEYS.LOCALITY);
    this.metaId = this._getString(AddressDataSource.KEYS.META_ID);
    this.operation = this._getString(AddressDataSource.KEYS.OPERATION);
    this.postalCode = this._getString(AddressDataSource.KEYS.POSTAL_CODE);
    this.status = this._getValue(AddressDataSource.KEYS.STATUS) as AddressType['status'];
    this.street = this._getString(AddressDataSource.KEYS.STREET);
    this.toBeDelete = this._getString(AddressDataSource.KEYS.TO_BE_DELETE);
    this.uid = this._getString(AddressDataSource.KEYS.UID);
    this.version = this._getString(AddressDataSource.KEYS.VERSION);
    this.versionId = this._getString(AddressDataSource.KEYS.VERSION_ID);
  }
}
