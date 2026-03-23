import { HttpHeaders } from '@angular/common/http';
import { CacheableEndpoint } from 'src/apiAndObjects/_lib_code/api/cacheableEndpoint.abstract';
import { RequestMethod } from 'src/apiAndObjects/_lib_code/api/requestMethod.enum';
import { PersistorService, StorageType } from 'src/services/persistor.service';
import { StorageKey } from 'src/utility/enums/storageKey.enum';
import { SoftwareDetailDataSource } from 'src/apiAndObjects/objects/data-source/softwareDetailDataSource';
import { SoftwareApplication } from 'generated/backofficeSchemas';

export class PutSoftwareDetail extends CacheableEndpoint<
  SoftwareDetailDataSource,
  SoftwareApplication,
  SoftwareDetailDataSource
> {
  private persistorService: PersistorService = new PersistorService();

  protected getCacheKey(body: SoftwareApplication): string {
    return JSON.stringify(body);
  }

  protected callLive(body: SoftwareApplication): Promise<SoftwareDetailDataSource> {
    const accessToken = this.persistorService.getValueFromStorage(StorageType.SESSION_STORAGE, StorageKey.ACCESS_TOKEN);
    const headers = (): HttpHeaders => {
      const headers = new HttpHeaders()
        .set('Authorization', accessToken ? `Bearer ${accessToken}` : '')
        .set('Content-Type', 'application/json');
      return headers;
    };
    const callResponsePromise = this.apiCaller.doCall(
      ['softwareapplication'],
      RequestMethod.PUT,
      undefined,
      body,
      headers,
    );

    return this.buildObjectFromResponse(SoftwareDetailDataSource, callResponsePromise).then(
      (response: SoftwareDetailDataSource) => response,
    );
  }

  protected callMock(): Promise<SoftwareDetailDataSource> {
    throw new Error('Method not implemented.');
  }
}
