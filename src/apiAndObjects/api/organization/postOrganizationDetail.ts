import { HttpHeaders } from '@angular/common/http';
import { CacheableEndpoint } from 'src/apiAndObjects/_lib_code/api/cacheableEndpoint.abstract';
import { RequestMethod } from 'src/apiAndObjects/_lib_code/api/requestMethod.enum';
import { PersistorService, StorageType } from 'src/services/persistor.service';
import { StorageKey } from 'src/utility/enums/storageKey.enum';
import { CreateUpdateOrganizationDataSource } from 'src/apiAndObjects/objects/createUpdateOrganizationDataSource';
import { Organization } from 'generated/backofficeSchemas';

export class PostOrganizationDetail extends CacheableEndpoint<
  CreateUpdateOrganizationDataSource,
  Organization,
  CreateUpdateOrganizationDataSource
> {
  private persistorService: PersistorService = new PersistorService();

  protected getCacheKey(body: Organization): string {
    return JSON.stringify(body);
  }

  protected callLive(body: Organization): Promise<CreateUpdateOrganizationDataSource> {
    const accessToken = this.persistorService.getValueFromStorage(StorageType.SESSION_STORAGE, StorageKey.ACCESS_TOKEN);
    const headers = (): HttpHeaders => {
      const headers = new HttpHeaders()
        .set('Authorization', accessToken ? `Bearer ${accessToken}` : '')
        .set('Content-Type', 'application/json');
      return headers;
    };
    const callResponsePromise = this.apiCaller.doCall(['organization'], RequestMethod.POST, undefined, body, headers);

    return this.buildObjectFromResponse(CreateUpdateOrganizationDataSource, callResponsePromise).then(
      (response: CreateUpdateOrganizationDataSource) => response,
    );
  }

  protected callMock(): Promise<CreateUpdateOrganizationDataSource> {
    throw new Error('Method not implemented.');
  }
}
