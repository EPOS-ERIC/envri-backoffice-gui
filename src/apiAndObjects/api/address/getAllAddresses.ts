import { HttpHeaders } from '@angular/common/http';
import { Address } from 'generated/backofficeSchemas';
import { Endpoint } from 'src/apiAndObjects/_lib_code/api/endpoint.abstract';
import { RequestMethod } from 'src/apiAndObjects/_lib_code/api/requestMethod.enum';
import { AddressDataSource } from 'src/apiAndObjects/objects/data-source/addressDataSource';
import { PersistorService, StorageType } from 'src/services/persistor.service';
import { StorageKey } from 'src/utility/enums/storageKey.enum';

export class GetAllAddresses extends Endpoint<Address[], undefined, Address> {
  private persistorService: PersistorService = new PersistorService();

  protected callLive(): Promise<Address[]> {
    const accessToken = this.persistorService.getValueFromStorage(StorageType.SESSION_STORAGE, StorageKey.ACCESS_TOKEN);
    const headers = (): HttpHeaders => {
      let authHeader = new HttpHeaders();
      authHeader = authHeader.append('Authorization', accessToken ? `Bearer ${accessToken}` : '');
      return authHeader;
    };

    const callResponsePromise = this.apiCaller.doCall(
      ['address/all'],
      RequestMethod.GET,
      undefined,
      undefined,
      headers,
    );
    return this.buildObjectsFromResponse(AddressDataSource, callResponsePromise);
  }

  protected callMock(): Promise<Address[]> {
    throw new Error('Method not implemented.');
  }
}
