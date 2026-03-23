import { HttpHeaders } from '@angular/common/http';
import { WebserviceDetailDataSource } from 'src/apiAndObjects/objects/data-source/webserviceDetailDataSource';
import { CacheableEndpoint } from 'src/apiAndObjects/_lib_code/api/cacheableEndpoint.abstract';
import { RequestMethod } from 'src/apiAndObjects/_lib_code/api/requestMethod.enum';
import { PersistorService, StorageType } from 'src/services/persistor.service';
import { StorageKey } from 'src/utility/enums/storageKey.enum';

export class GetWebserviceDetail extends CacheableEndpoint<
  Array<WebserviceDetailDataSource>,
  GetWebserviceDetailParams,
  WebserviceDetailDataSource
> {
  private persistorService: PersistorService = new PersistorService();

  protected getCacheKey(params: GetWebserviceDetailParams): string {
    return JSON.stringify(params);
  }

  protected callLive(params: GetWebserviceDetailParams): Promise<Array<WebserviceDetailDataSource>> {
    const accessToken = this.persistorService.getValueFromStorage(StorageType.SESSION_STORAGE, StorageKey.ACCESS_TOKEN);
    const headers = (): HttpHeaders => {
      let authHeader = new HttpHeaders();
      authHeader = authHeader.append('Authorization', accessToken ? `Bearer ${accessToken}` : '');
      return authHeader;
    };
    const callResponsePromise = this.apiCaller
      .doCall(`webservice/${params.metaId}/${params.instanceId}`, RequestMethod.GET, undefined, undefined, headers)
      .then((data: unknown) => this.processResponseData(data, params));
    return this.buildObjectsFromResponse(WebserviceDetailDataSource, callResponsePromise);
  }

  protected callMock(): Promise<WebserviceDetailDataSource[]> {
    // const httpClient = this.injector.get<HttpClient>(HttpClient);
    return this.buildObjectsFromResponse(
      WebserviceDetailDataSource,
      new Promise((resolve) => {
        setTimeout(() => {
          resolve(mockGet);
        }, 100);
      }),
    );
  }

  private processResponseData(
    data: Array<Record<string, unknown>> | unknown,
    params: GetWebserviceDetailParams,
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

export interface GetWebserviceDetailParams {
  singleOptionOnly?: boolean;
  metaId: string;
  instanceId: string;
  // dataSource: WebserviceDetailDataSource;
}

const mockGet = {
  uid: 'https://www.epos-eu.org/epos-dcat-ap/NearFaultObservatory/KOERI/Event/WebService/001',
  aaaiTypes: '',
  category: [],
  changeComment: '',
  changeTimestamp: '2024-08-05T13:41:04.144Z',
  contactPoint: [
    {
      entityType: 'CONTACTPOINT',
      instanceId: '18b8ce1d-0581-4d11-8c5b-0e165ce1fa8c',
      metaId: '1bc6cd3f-49bb-4414-bdbf-b19817a67127',
      uid: 'https://orcid.org/0000-0003-4612-7421/technicalContact',
    },
    {
      entityType: 'CONTACTPOINT',
      instanceId: 'f3bdf168-da3e-4679-9481-7b18ee386ff0',
      metaId: 'cad7a1c8-2d97-43ad-a489-7eed676c9eaa',
      uid: 'https://orcid.org/0000-0001-7080-183X/scientificContact',
    },
  ],
  dateModified: '2024-08-06T09:48:13.614Z',
  datePublished: '2005-01-01T00:00:00.000Z',
  description:
    'This web service provides access to Instrumental Earthquakes data (in terms of location and magnitude) through FDSN Event web service. Datasets are encoded in QuakeML and text format. Its related dataset covers the time period since 2005 and is limited to the Marmara (Turkey) Near Fault Observatory.',
  distribution: [
    {
      entityType: 'Distribution',
      instanceId: 'c839f8a4-3c44-4edd-b0b3-4aeadc275898',
      metaId: '3dec6ccc-0578-43dd-9dae-b7b83adfd84a',
      uid: 'https://www.epos-eu.org/epos-dcat-ap/NearFaultObservatory/KOERI/Event/Distribution/001',
    },
  ],
  documentation: [{ description: '', title: '', uri: 'https://www.fdsn.org/webservices/fdsnws-event-1.2.pdf' }],
  editorId: 'ingestor',
  entryPoint: '',
  fileProvenance: '/metadata-cache/EPOS-DCAT-AP_WP09_KOERI_EVENT.ttl',
  identifier: [],
  instanceChangedId: '0fd5a535-31db-49d6-b693-1aea637a1538',
  instanceId: '0fd5a535-31db-49d6-b693-1aea637a1538',
  keywords:
    'seismology,\tNear Fault Observatories,\tMarmara Near Fault Observatory,\tseismic catalog,\tNFO,\tevent,\tFRIDGE,\tKOERI,\tearthquake,\tseismic waves propagation,\tMarmara,\tseismicity,\tseismic source',
  license: 'https://creativecommons.org/licenses/by/4.0/',
  metaId: '90746430-c751-4254-b66d-be3e0929ff91',
  name: 'Marmara - FDSN Event Web Service Update',
  operation: '',
  provider: {
    entityType: 'Organization',
    instanceId: 'b8fd8040-e95b-4aac-bca7-0c78e02ea071',
    metaId: '404c74ac-5038-4aa4-8e1b-6b76af2f9ada',
    uid: 'PIC:999882500',
  },
  schemaIdentifier: '',
  spatialExtent: [
    {
      entityType: 'LOCATION',
      instanceId: '8fb225f4-eafd-4ee2-87a2-8c176e816398',
      metaId: '0720ccef-0e70-40a1-8f56-badcfcb4f6a1',
      uid: '_:a157903f3e13dbf8182bdc58166c7d96',
    },
  ],
  state: 'DRAFT',
  supportedOperation: [
    {
      entityType: 'Operation',
      instanceId: '3832131d-6f9d-4602-9ca1-03e074f42ccc',
      metaId: 'ee70e3f1-6eb4-4a28-891b-01aa1bd359cc',
      uid: 'https://www.epos-eu.org/epos-dcat-ap/NearFaultObservatory/KOERI/Event/WebService/001/Operation/001',
    },
  ],
  temporalExtent: [
    {
      entityType: 'PERIODOFTIME',
      instanceId: '352aa348-eb8f-420f-b708-16867349ed54',
      metaId: '70ecdd33-3394-41f3-950b-512722dfe9a8',
      uid: '_:932d161ddf720ececbd1a36aa361aecb',
    },
  ],
  toBeDelete: 'false',
  version: '',
};
