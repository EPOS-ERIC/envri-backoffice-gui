import { Injectable, Injector } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { BaseApi } from '../_lib_code/api/baseApi.abstract';
import { EposBackOfficeHttpResponseHandler } from './eposBackofficeHttpResponseHandler';
import { GetDistributionDetail } from './distribution/getDistributionDetail';
import { GetWebserviceDetail } from './webservice/getWebserviceDetail';
import { GetOperationDetails } from './operation/getOperationDetails';
import { GetDataProductDetail } from './data-products/getDataProductDetail';
import { GetContactPointDetail } from './contact-point/getContactPointDetail';
import { PostDataProductDetails } from './data-products/postDataProductDetails';
import { PutDataProductDetail } from './data-products/putDataProductDetail';
import { GetUserInfo } from './user/getUserDetail';
import { GetAllDataProducts } from './data-products/getAllDataProducts';
import { GetAllWebservices } from './webservice/getAllWebservices';
import { GetAllDistributions } from './distribution/getAllDistributions';
import { GetAllContactPoints } from './contact-point/getAllContactPoints';
import { GetAllUsers } from './user/getAllUsers';
import { GetAllOrganizations } from './organization/getAllOrganizations';
import { GetAllOperations } from './operation/getAllOperations';
import { PostDistributionDetail } from './distribution/postDistributionDetail';
import { RequestMethod } from '../_lib_code/api/requestMethod.enum';
import { PersistorService, StorageType } from 'src/services/persistor.service';
import { StorageKey } from 'src/utility/enums/storageKey.enum';
import { EntityEndpointValue } from 'src/utility/enums/entityEndpointValue.enum';
import { PutDistributionDetail } from './distribution/putDistributionDetail';
import { PostContactPointDetail } from './contact-point/postContactPointDetail';
import { PostOperationDetail } from './operation/postOperationDetail';
import { PostOrganizationDetail } from './organization/postOrganizationDetail';
import { PostWebserviceDetail } from './webservice/postWebserviceDetail';
import { PutWebserviceDetail } from './webservice/putWebserviceDetail';
import { PostUserDetail } from './user/postUserDetail';
import { PutUserDetail } from './user/putUserDetail';
import { PutContactPointDetail } from './contact-point/putContactPointDetail';
import { PutOperationDetail } from './operation/putOperationDetail';
import { GetAllDataProductVersions } from './data-products/getAllDataProductVersions';
import { PutDataProductState } from './data-products/putDataProductState';
import { GetAllGroups } from './group/getAllGroups';
import { GetGroup } from './group/getGroup';
import { PostGroup } from './group/postGroup';
import { PutGroup } from './group/putGroup';
import { GetLocation } from './location/getLocation';
import { GetAllLocations } from './location/getAllLocations';
import { PostLocation } from './location/postLocation';
import { PutLocation } from './location/putLocation';
import { GetPeriodOfTime } from './periodOfTime/getPeriodOfTime';
import { GetAllPeriodOfTime } from './periodOfTime/getAllPeriodOfTime';
import { PostPeriodOfTime } from './periodOfTime/postPeriodOfTime';
import { PutPeriodOfTime } from './periodOfTime/putPeriodOfTime';
import { GetPersonDetail } from './person/getPersonDetail';
import { GetAllPeople } from './person/getAllPeople';
import { CreatePersonDetail } from './person/createPersonDetail';
import { UpdatePersonDetail } from './person/updatePersonDetail';
import { GetIdentifier } from './identifier/getIdentifier';
import { GetAllIdentifiers } from './identifier/getAllIdentifiers';
import { PostIdentifier } from './identifier/postIdentifier';
import { PutIdentifier } from './identifier/putIdentifier';
import { GetMapping } from './mapping/getMapping';
import { GetAllMapping } from './mapping/getAllMapping';
import { PostMapping } from './mapping/postMapping';
import { PutMapping } from './mapping/putMapping';
import { GetDocumentation } from './documentation/getDocumentation';
import { GetAllDocumentation } from './documentation/getAllDocumentations';
import { PostDocumentation } from './documentation/postDocumentation';
import { PutDocumentation } from './documentation/putDocumentation';
import { GetCategory } from './category/getCategory';
import { GetAllCategorys } from './category/getAllCategorys';
import { PostCategory } from './category/postCategory';
import { PutCategory } from './category/putCategory';
import { GetCategoryScheme } from './categoryScheme/getCategorySchemes';
import { GetAllCategorySchemes } from './categoryScheme/getAllCategorySchemes';
import { PostCategoryScheme } from './categoryScheme/postCategorySchemes';
import { PutCategoryScheme } from './categoryScheme/putCategorySchemes';
import { DeleteCategoryScheme } from './categoryScheme/deleteCategoryScheme';
import { PutUpdateUserInGroup } from './group/putUpdateUserInGroup';
import { PostAddEntityToGroup } from './group/postAddEntityToGroup';
import { GetUserByID } from './user/getUserById';
import { PostAddUserToGroup } from './group/postAddUserToGroup';
import { DeleteRemoveUserFromGroup } from './group/deleteRemoveUserFromGroup';
import { GetCategorySchemeInstances } from './categoryScheme/getCategorySchemesInstances';
import { GetAllSoftware } from './software-application/getAllSoftware';
import { GetSoftwareDetail } from './software-application/getSoftwareDetail';
import { PostSoftwareDetail } from './software-application/postSoftwareDetail';
import { PutSoftwareDetail } from './software-application/putSoftwareDetail';
import { PutSoftwareState } from './software-application/putSoftwareState';
import { GetAllSoftwareVersions } from './software-application/getAllSoftwareVersions';
import { GetAllSourceCode } from './software-source-code/getAllSourceCode';
import { GetSourceCodeDetail } from './software-source-code/getSourceCodeDetail';
import { PostSourceCodeDetail } from './software-source-code/postSourceCodeDetail';
import { PutSourceCodeDetail } from './software-source-code/putSourceCodeDetail';
import { PutSourceCodeState } from './software-source-code/putSourceCodeState';
import { GetAllSourceCodeVersions } from './software-source-code/getAllSourceCodeVersions';
import { GetDistributionPlugins } from './distribution-plugin/getDistributionPlugins';
import { PostDistributionPluginSendEmail } from './distribution-plugin/postDistributionPluginSendEmail';
import { DeleteDistributionPlugins } from './distribution-plugin/deleteDistributionPlugins';
import { GetAllECV } from './ECV/getAllECV';

@Injectable()
export class ApiService extends BaseApi {
  // turn on mock data by setting this to false
  private static readonly USE_LIVE_API = environment.useLiveApi;

  public readonly endpoints = {
    /* DDSS Entities */
    DataProduct: {
      get: new GetDataProductDetail(ApiService.USE_LIVE_API),
      getAll: new GetAllDataProducts(ApiService.USE_LIVE_API),
      create: new PostDataProductDetails(ApiService.USE_LIVE_API),
      update: new PutDataProductDetail(ApiService.USE_LIVE_API),
      updateState: new PutDataProductState(ApiService.USE_LIVE_API),
      getAllVersions: new GetAllDataProductVersions(ApiService.USE_LIVE_API),
    },
    WebService: {
      get: new GetWebserviceDetail(ApiService.USE_LIVE_API),
      getAll: new GetAllWebservices(ApiService.USE_LIVE_API),
      create: new PostWebserviceDetail(ApiService.USE_LIVE_API),
      update: new PutWebserviceDetail(ApiService.USE_LIVE_API),
    },
    Distribution: {
      get: new GetDistributionDetail(ApiService.USE_LIVE_API),
      getAll: new GetAllDistributions(ApiService.USE_LIVE_API),
      create: new PostDistributionDetail(ApiService.USE_LIVE_API),
      update: new PutDistributionDetail(ApiService.USE_LIVE_API),
    },
    DistributionPlugin: {
      getAll: new GetDistributionPlugins(ApiService.USE_LIVE_API),
      sendEmail: new PostDistributionPluginSendEmail(ApiService.USE_LIVE_API),
      remove: new DeleteDistributionPlugins(ApiService.USE_LIVE_API),
    },
    SoftwareApplication: {
      get: new GetSoftwareDetail(ApiService.USE_LIVE_API),
      getAll: new GetAllSoftware(ApiService.USE_LIVE_API),
      create: new PostSoftwareDetail(ApiService.USE_LIVE_API),
      update: new PutSoftwareDetail(ApiService.USE_LIVE_API),
      updateState: new PutSoftwareState(ApiService.USE_LIVE_API),
      getAllVersions: new GetAllSoftwareVersions(ApiService.USE_LIVE_API),
    },
    SoftwareSourceCode: {
      get: new GetSourceCodeDetail(ApiService.USE_LIVE_API),
      getAll: new GetAllSourceCode(ApiService.USE_LIVE_API),
      create: new PostSourceCodeDetail(ApiService.USE_LIVE_API),
      update: new PutSourceCodeDetail(ApiService.USE_LIVE_API),
      updateState: new PutSourceCodeState(ApiService.USE_LIVE_API),
      getAllVersions: new GetAllSourceCodeVersions(ApiService.USE_LIVE_API),
    },
    ContactPoint: {
      get: new GetContactPointDetail(ApiService.USE_LIVE_API),
      getAll: new GetAllContactPoints(ApiService.USE_LIVE_API),
      create: new PostContactPointDetail(ApiService.USE_LIVE_API),
      update: new PutContactPointDetail(ApiService.USE_LIVE_API),
    },
    Operation: {
      get: new GetOperationDetails(ApiService.USE_LIVE_API),
      getAll: new GetAllOperations(ApiService.USE_LIVE_API),
      create: new PostOperationDetail(ApiService.USE_LIVE_API),
      update: new PutOperationDetail(ApiService.USE_LIVE_API),
    },
    Mapping: {
      get: new GetMapping(ApiService.USE_LIVE_API),
      getAll: new GetAllMapping(ApiService.USE_LIVE_API),
      create: new PostMapping(ApiService.USE_LIVE_API),
      update: new PutMapping(ApiService.USE_LIVE_API),
    },
    Documentation: {
      get: new GetDocumentation(ApiService.USE_LIVE_API),
      getAll: new GetAllDocumentation(ApiService.USE_LIVE_API),
      create: new PostDocumentation(ApiService.USE_LIVE_API),
      update: new PutDocumentation(ApiService.USE_LIVE_API),
    },
    Category: {
      get: new GetCategory(ApiService.USE_LIVE_API),
      getAll: new GetAllCategorys(ApiService.USE_LIVE_API),
      create: new PostCategory(ApiService.USE_LIVE_API),
      update: new PutCategory(ApiService.USE_LIVE_API),
    },
    CategoryScheme: {
      get: new GetCategoryScheme(ApiService.USE_LIVE_API),
      getSchemeInstances: new GetCategorySchemeInstances(ApiService.USE_LIVE_API),
      getAll: new GetAllCategorySchemes(ApiService.USE_LIVE_API),
      create: new PostCategoryScheme(ApiService.USE_LIVE_API),
      update: new PutCategoryScheme(ApiService.USE_LIVE_API),
      delete: new DeleteCategoryScheme(ApiService.USE_LIVE_API),
    },
    /* Administrative Entities */
    Organization: {
      getAll: new GetAllOrganizations(ApiService.USE_LIVE_API),
      create: new PostOrganizationDetail(ApiService.USE_LIVE_API),
    },
    User: {
      get: new GetUserInfo(ApiService.USE_LIVE_API),
      getUserById: new GetUserByID(ApiService.USE_LIVE_API),
      getAll: new GetAllUsers(ApiService.USE_LIVE_API),
      create: new PostUserDetail(ApiService.USE_LIVE_API),
      update: new PutUserDetail(ApiService.USE_LIVE_API),
    },
    Person: {
      get: new GetPersonDetail(ApiService.USE_LIVE_API),
      getAll: new GetAllPeople(ApiService.USE_LIVE_API),
      create: new CreatePersonDetail(ApiService.USE_LIVE_API),
      update: new UpdatePersonDetail(ApiService.USE_LIVE_API),
    },
    Group: {
      get: new GetGroup(ApiService.USE_LIVE_API),
      getAll: new GetAllGroups(ApiService.USE_LIVE_API),
      create: new PostGroup(ApiService.USE_LIVE_API),
      update: new PutGroup(ApiService.USE_LIVE_API),
      updateUserInGroup: new PutUpdateUserInGroup(ApiService.USE_LIVE_API),
      addEntityToGroup: new PostAddEntityToGroup(ApiService.USE_LIVE_API),
      addUserToGroup: new PostAddUserToGroup(ApiService.USE_LIVE_API),
      removeUserFromGroup: new DeleteRemoveUserFromGroup(ApiService.USE_LIVE_API),
    },
    Identifier: {
      get: new GetIdentifier(ApiService.USE_LIVE_API),
      getAll: new GetAllIdentifiers(ApiService.USE_LIVE_API),
      create: new PostIdentifier(ApiService.USE_LIVE_API),
      update: new PutIdentifier(ApiService.USE_LIVE_API),
    },
    /* Spatial / Temporal Entities */
    Location: {
      get: new GetLocation(ApiService.USE_LIVE_API),
      getAll: new GetAllLocations(ApiService.USE_LIVE_API),
      create: new PostLocation(ApiService.USE_LIVE_API),
      update: new PutLocation(ApiService.USE_LIVE_API),
    },
    PeriodOfTime: {
      get: new GetPeriodOfTime(ApiService.USE_LIVE_API),
      getAll: new GetAllPeriodOfTime(ApiService.USE_LIVE_API),
      create: new PostPeriodOfTime(ApiService.USE_LIVE_API),
      update: new PutPeriodOfTime(ApiService.USE_LIVE_API),
    },

    ECV: {
      getAll: new GetAllECV(ApiService.USE_LIVE_API),
    }
  };

  constructor(httpClient: HttpClient, injector: Injector, private persistorService: PersistorService) {
    super(injector, httpClient, new EposBackOfficeHttpResponseHandler(injector), environment.apiBaseUrl);

    // Add endpoints
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Object.values(this.endpoints).forEach((group: any) => {
      this.addEndpoints(Object.values(group));
    });
  }

  /* Generic non-entity specific delete function */
  public deleteEntity(entityEndpoint: EntityEndpointValue, instanceId: string): Promise<string> {
    const accessToken = this.persistorService.getValueFromStorage(StorageType.SESSION_STORAGE, StorageKey.ACCESS_TOKEN);
    const headers = (): HttpHeaders => {
      const headers = new HttpHeaders()
        .set('Authorization', accessToken ? `Bearer ${accessToken}` : '')
        .set('Content-Type', 'application/json');
      return headers;
    };
    const callResponsePromise = this.apiCaller.doCall(
      [entityEndpoint, instanceId],
      RequestMethod.DELETE,
      undefined,
      undefined,
      headers,
    );
    return callResponsePromise as Promise<string>;
  }
}
