import { HttpHeaders } from '@angular/common/http';
import { RequestMethod } from 'src/apiAndObjects/_lib_code/api/requestMethod.enum';
import { PersistorService, StorageType } from 'src/services/persistor.service';
import { StorageKey } from 'src/utility/enums/storageKey.enum';
import { Endpoint } from 'src/apiAndObjects/_lib_code/api/endpoint.abstract';
import { EXVSDetailDataSource } from 'src/apiAndObjects/objects/data-source/exvsDetailDataSource';

export class GetAllECV extends Endpoint<Array<EXVSDetailDataSource>, GetAllECVParams, Array<EXVSDetailDataSource>> {
  private persistorService: PersistorService = new PersistorService();

  protected getCacheKey(params: GetAllECVParams): string {
    return JSON.stringify(params);
  }

  protected callLive(): Promise<EXVSDetailDataSource[]> {
    const accessToken = this.persistorService.getValueFromStorage(StorageType.SESSION_STORAGE, StorageKey.ACCESS_TOKEN);
    const headers = (): HttpHeaders => {
      let authHeader = new HttpHeaders();
      authHeader = authHeader.append('Authorization', accessToken ? `Bearer ${accessToken}` : '');
      return authHeader;
    };

    const callResponsePromise = this.apiCaller.doCall(
      ['resources/exvs'],
      RequestMethod.GET,
      undefined,
      undefined,
      headers,
    );
    return this.buildObjectsFromResponse(EXVSDetailDataSource, callResponsePromise).then((result) =>
      result.flat()
    );
  }

  protected callMock(): Promise<EXVSDetailDataSource[]> {
    throw new Error('Method not implemented.');
  }
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface GetAllECVParams {}