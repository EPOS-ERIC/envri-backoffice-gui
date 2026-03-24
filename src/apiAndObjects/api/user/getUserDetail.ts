import { HttpHeaders } from '@angular/common/http';
import { UserInfoDataSource } from 'src/apiAndObjects/objects/data-source/userInfoDataSource';
import { CacheableEndpoint } from 'src/apiAndObjects/_lib_code/api/cacheableEndpoint.abstract';
import { RequestMethod } from 'src/apiAndObjects/_lib_code/api/requestMethod.enum';
import { PersistorService, StorageType } from 'src/services/persistor.service';
import { StorageKey } from 'src/utility/enums/storageKey.enum';

export class GetUserInfo extends CacheableEndpoint<UserInfoDataSource, GetUserInfoParams, UserInfoDataSource> {
  private persistorService: PersistorService = new PersistorService();

  protected getCacheKey(params: GetUserInfoParams): string {
    return JSON.stringify(params);
  }

  protected callLive(params: GetUserInfoParams): Promise<UserInfoDataSource> {
    const accessToken = this.persistorService.getValueFromStorage(StorageType.SESSION_STORAGE, StorageKey.ACCESS_TOKEN);
    const headers = (): HttpHeaders => {
      let authHeader = new HttpHeaders();
      authHeader = authHeader.append('Authorization', accessToken ? `Bearer ${accessToken}` : '');
      return authHeader;
    };
    const callResponsePromise = this.apiCaller.doCall(
      ['/user/self'],
      RequestMethod.GET,
      {
        available_section: String(params.available_section),
      },
      undefined,
      headers,
    );

    return this.buildObjectFromResponse(UserInfoDataSource, callResponsePromise).then(
      (userInfo: UserInfoDataSource) => userInfo,
    );
  }

  protected callMock(): Promise<UserInfoDataSource> {
    throw new Error('Method not implemented.');
  }
}

export interface GetUserInfoParams {
  available_section: boolean;
}
