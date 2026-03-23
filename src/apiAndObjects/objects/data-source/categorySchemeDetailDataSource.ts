import { CategoryScheme as CategorySchemeType, LinkedEntity } from 'generated/backofficeSchemas';
import { BaseObject } from 'src/apiAndObjects/_lib_code/objects/baseObject';
import { Status } from 'src/utility/enums/status.enum';

export class CategorySchemeDataSource extends BaseObject implements CategorySchemeType {
  public static readonly KEYS = {
    CHANGE_COMMENT: 'changeComment',
    CHANGE_TIMESTAMP: 'changeTimestamp',
    CODE: 'code',
    COLOR: 'color',
    DESCRIPTION: 'description',
    EDITOR_ID: 'editorId',
    FILE_PROVENANCE: 'fileProvenance',
    GROUPS: 'groups',
    HOMEPAGE: 'homepage',
    INSTANCE_CHANGED_ID: 'instanceChangedId',
    INSTANCE_ID: 'instanceId',
    LOGO: 'logo',
    META_ID: 'metaId',
    OPERATION: 'operation',
    ORDER_ITEM_NUMBER: 'orderitemnumber',
    STATUS: 'status',
    TITLE: 'title',
    TO_BE_DELETE: 'toBeDelete',
    TOP_CONCEPTS: 'topConcepts',
    UID: 'uid',
    VERSION: 'version',
    VERSION_ID: 'versionId',
  };

  public readonly changeComment: string;
  public readonly changeTimestamp: string;
  public readonly code: string;
  public readonly color: string;
  public readonly description: string;
  public readonly editorId: string;
  public readonly fileProvenance: string;
  public readonly groups: string[];
  public readonly homepage: string;
  public readonly instanceChangedId: string;
  public readonly instanceId: string;
  public readonly logo: string;
  public readonly metaId: string;
  public readonly operation: string;
  public readonly orderitemnumber: string;
  public readonly status: Status;
  public readonly title: string;
  public readonly toBeDelete: string;
  public readonly topConcepts: LinkedEntity[];
  public readonly uid: string;
  public readonly version: string;
  public readonly versionId: string;

  protected constructor(sourceObject?: Record<string, unknown>) {
    super(sourceObject);
    this.changeComment = this._getString(CategorySchemeDataSource.KEYS.CHANGE_COMMENT);
    this.changeTimestamp = this._getString(CategorySchemeDataSource.KEYS.CHANGE_TIMESTAMP);
    this.code = this._getString(CategorySchemeDataSource.KEYS.CODE);
    this.color = this._getString(CategorySchemeDataSource.KEYS.COLOR);
    this.description = this._getString(CategorySchemeDataSource.KEYS.DESCRIPTION);
    this.editorId = this._getString(CategorySchemeDataSource.KEYS.EDITOR_ID);
    this.fileProvenance = this._getString(CategorySchemeDataSource.KEYS.FILE_PROVENANCE);
    this.groups = this._getArray(CategorySchemeDataSource.KEYS.GROUPS);
    this.homepage = this._getString(CategorySchemeDataSource.KEYS.HOMEPAGE);
    this.instanceChangedId = this._getString(CategorySchemeDataSource.KEYS.INSTANCE_CHANGED_ID);
    this.instanceId = this._getString(CategorySchemeDataSource.KEYS.INSTANCE_ID);
    this.logo = this._getString(CategorySchemeDataSource.KEYS.LOGO);
    this.metaId = this._getString(CategorySchemeDataSource.KEYS.META_ID);
    this.operation = this._getString(CategorySchemeDataSource.KEYS.OPERATION);
    this.orderitemnumber = this._getString(CategorySchemeDataSource.KEYS.ORDER_ITEM_NUMBER);
    this.status = this._getValue(CategorySchemeDataSource.KEYS.STATUS) as Status;
    this.title = this._getString(CategorySchemeDataSource.KEYS.TITLE);
    this.toBeDelete = this._getString(CategorySchemeDataSource.KEYS.TO_BE_DELETE);
    this.topConcepts = this._getArray(CategorySchemeDataSource.KEYS.TOP_CONCEPTS);
    this.uid = this._getString(CategorySchemeDataSource.KEYS.UID);
    this.version = this._getString(CategorySchemeDataSource.KEYS.VERSION);
    this.versionId = this._getString(CategorySchemeDataSource.KEYS.VERSION_ID);
  }
}
