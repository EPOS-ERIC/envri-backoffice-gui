import { HttpHeaders } from '@angular/common/http';
import { Endpoint } from 'src/apiAndObjects/_lib_code/api/endpoint.abstract';
import { RequestMethod } from 'src/apiAndObjects/_lib_code/api/requestMethod.enum';
import { PersistorService, StorageType } from 'src/services/persistor.service';
import { StorageKey } from 'src/utility/enums/storageKey.enum';
import { Operation } from 'src/apiAndObjects/objects/entities/operation.model';
import { OperationDetailDataSource } from 'src/apiAndObjects/objects/data-source/operationDetailDataSource';

export class PostOperationDetail extends Endpoint<
  OperationDetailDataSource,
  Operation,
  OperationDetailDataSource
> {
  private persistorService: PersistorService = new PersistorService();

  protected callLive(body: Operation): Promise<OperationDetailDataSource> {
    const accessToken = this.persistorService.getValueFromStorage(StorageType.SESSION_STORAGE, StorageKey.ACCESS_TOKEN);
    const headers = (): HttpHeaders => {
      const headers = new HttpHeaders()
        .set('Authorization', accessToken ? `Bearer ${accessToken}` : '')
        .set('Content-Type', 'application/json');
      return headers;
    };
    const callResponsePromise = this.apiCaller.doCall(['operation'], RequestMethod.POST, undefined, body, headers);

    return this.buildObjectFromResponse(OperationDetailDataSource, callResponsePromise).then(
      (response: OperationDetailDataSource) => response,
    );
  }

  protected callMock(): Promise<OperationDetailDataSource> {
    throw new Error('Method not implemented.');
  }
}
