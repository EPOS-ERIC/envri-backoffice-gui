import { HttpHeaders } from '@angular/common/http';
import { CacheableEndpoint } from 'src/apiAndObjects/_lib_code/api/cacheableEndpoint.abstract';
import { RequestMethod } from 'src/apiAndObjects/_lib_code/api/requestMethod.enum';
import { PersistorService, StorageType } from 'src/services/persistor.service';
import { StorageKey } from 'src/utility/enums/storageKey.enum';
import { SoftwareDetailDataSource } from 'src/apiAndObjects/objects/data-source/softwareDetailDataSource';

export class GetSoftwareDetail extends CacheableEndpoint<
  Array<SoftwareDetailDataSource>,
  GetSoftwareDetailsParams,
  SoftwareDetailDataSource
> {
  private persistorService: PersistorService = new PersistorService();

  protected getCacheKey(params: GetSoftwareDetailsParams): string {
    return JSON.stringify(params);
  }

  protected callLive(params: GetSoftwareDetailsParams): Promise<Array<SoftwareDetailDataSource>> {
    const accessToken = this.persistorService.getValueFromStorage(StorageType.SESSION_STORAGE, StorageKey.ACCESS_TOKEN);
    const headers = (): HttpHeaders => {
      let authHeader = new HttpHeaders();
      authHeader = authHeader.append('Authorization', accessToken ? `Bearer ${accessToken}` : '');
      return authHeader;
    };
    const callResponsePromise = this.apiCaller
      .doCall(
        `softwareapplication/${params.metaId}/${params.instanceId}`,
        RequestMethod.GET,
        undefined,
        undefined,
        headers,
      )
      .then((data: unknown) => this.processResponseData(data, params));
    return this.buildObjectsFromResponse(SoftwareDetailDataSource, callResponsePromise);
  }

  protected callMock(): Promise<SoftwareDetailDataSource[]> {
    // const httpClient = this.injector.get<HttpClient>(HttpClient);
    return this.buildObjectsFromResponse(
      SoftwareDetailDataSource,
      new Promise((resolve) => {
        setTimeout(() => {
          resolve(mockGet);
        }, 100);
      }),
    );
  }

  private processResponseData(
    data: Array<Record<string, unknown>> | unknown,
    params: GetSoftwareDetailsParams,
  ): Array<Record<string, unknown>> {
    if (Array.isArray(data)) {
      data.forEach((item: Record<string, unknown>, index: number) => (item['id'] = String(index).valueOf()));
      return params.singleOptionOnly === true ? data.slice(0, 1) : data;
    } else {
      const dataAsArr: Array<Record<string, unknown>> = [];
      dataAsArr.push(data as Record<string, unknown>);
      dataAsArr.forEach((item: Record<string, unknown>, index: number) => (item['id'] = String(index).valueOf()));
      return params.singleOptionOnly === true ? dataAsArr.slice(0, 1) : dataAsArr;
    }
  }
}

export interface GetSoftwareDetailsParams {
  singleOptionOnly?: boolean;
  metaId: string;
  instanceId: string;
}

const mockGet = {
  uid: 'https://www.epos-eu.org/epos-dcat-ap/NearFaultObservatory/KOERI/Event/Distribution/001',
  accessService: {
    entityType: 'webservice',
    instanceId: '0fd5a535-31db-49d6-b693-1aea637a1538',
    metaId: '90746430-c751-4254-b66d-be3e0929ff91',
    uid: 'https://www.epos-eu.org/epos-dcat-ap/NearFaultObservatory/KOERI/Event/WebService/001',
  },
  accessURL: [
    {
      entityType: 'operation',
      instanceId: '3832131d-6f9d-4602-9ca1-03e074f42ccc',
      metaId: 'ee70e3f1-6eb4-4a28-891b-01aa1bd359cc',
      uid: 'https://www.epos-eu.org/epos-dcat-ap/NearFaultObservatory/KOERI/Event/WebService/001/Operation/001',
    },
  ],
  changeComment: '',
  changeTimestamp: '2024-08-06T08:46:46.361Z',
  conformsTo: '',
  dataPolicy: '',
  dataProduct: [
    {
      entityType: 'DATAPRODUCT',
      instanceId: '3350e57a-5c2b-4f3d-9b85-7bbd0f899f13',
      metaId: 'd5e833bb-f02a-4b8d-a9ab-cc67f4d841c3',
      uid: 'https://www.epos-eu.org/epos-dcat-ap/NearFaultObservatory/KOERI/Event/Dataset/001',
    },
  ],
  description: [
    'This distribution provides access to Instrumental Earthquakes data (in terms of location and magnitude) through FDSN Event web service. Datasets are encoded in QuakeML and text format. Its related dataset covers the time period since 2005 and is limited to the Marmara (Turkey) Near Fault Observatory.',
  ],
  downloadURL: [],
  editorId: 'fixedUser2_metaid',
  fileProvenance: 'instance created with the backoffice',
  format: 'http://publications.europa.eu/resource/authority/file-type/XML',
  groups: [],
  instanceChangedId: '84f2e836-85bc-48ed-955a-1146b1ad52b2',
  instanceId: 'c839f8a4-3c44-4edd-b0b3-4aeadc275898',
  licence: 'https://creativecommons.org/licenses/by/4.0/',
  metaId: '3dec6ccc-0578-43dd-9dae-b7b83adfd84a',
  modified: '2024-08-06T09:58:22.617Z',
  operation: '',
  state: 'DRAFT',
  title: ['Marmara Seismic Events'],
  toBeDelete: 'false',
  type: 'http://publications.europa.eu/resource/authority/distribution-type/WEB_SERVICE',
  version: '',
};
