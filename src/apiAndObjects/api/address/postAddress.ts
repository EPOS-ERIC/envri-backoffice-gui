import { HttpHeaders } from '@angular/common/http';
import { Address } from 'generated/backofficeSchemas';
import { Endpoint } from 'src/apiAndObjects/_lib_code/api/endpoint.abstract';
import { RequestMethod } from 'src/apiAndObjects/_lib_code/api/requestMethod.enum';
import { AddressDataSource } from 'src/apiAndObjects/objects/data-source/addressDataSource';
import { PersistorService, StorageType } from 'src/services/persistor.service';
import { StorageKey } from 'src/utility/enums/storageKey.enum';

export class PostAddress extends Endpoint<AddressDataSource, Address, AddressDataSource> {
  private persistorService: PersistorService = new PersistorService();

  protected callLive(body: Address): Promise<AddressDataSource> {
    const accessToken = this.persistorService.getValueFromStorage(StorageType.SESSION_STORAGE, StorageKey.ACCESS_TOKEN);
    const headers = (): HttpHeaders => {
      return new HttpHeaders()
        .set('Authorization', accessToken ? `Bearer ${accessToken}` : '')
        .set('Content-Type', 'application/json');
    };
    const callResponsePromise = this.apiCaller.doCall(['address'], RequestMethod.POST, undefined, body, headers);

    return this.buildObjectFromResponse(AddressDataSource, callResponsePromise);
  }

  protected callMock(): Promise<AddressDataSource> {
    throw new Error('Method not implemented.');
  }
}
