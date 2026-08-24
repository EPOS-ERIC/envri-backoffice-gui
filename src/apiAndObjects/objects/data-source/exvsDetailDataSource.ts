import { BaseObject } from 'src/apiAndObjects/_lib_code/objects/baseObject';

export class EXVSDetailDataSource extends BaseObject {
  public static readonly KEYS = {
    NAME: 'name',
    URI: 'uri',
  };

  public readonly name: string;
  public readonly uri: string;

  protected constructor(sourceObject?: Record<string, unknown>) {
    super(sourceObject);
    this.name = this._getString(EXVSDetailDataSource.KEYS.NAME);
    this.uri = this._getString(EXVSDetailDataSource.KEYS.URI);
  }
}
