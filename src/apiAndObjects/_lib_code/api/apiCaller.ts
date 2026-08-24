import { lastValueFrom, Observable } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { HttpResponseHandler } from './httpResponseHandler.interface';
import { RequestMethod } from './requestMethod.enum';
import { SavePersonBody } from 'src/apiAndObjects/api/person/createPersonDetail';
import { SaveUserBody } from 'src/apiAndObjects/api/user/postUserDetail';
import { DataProduct } from 'src/apiAndObjects/objects/entities/dataProduct.model';
import { Distribution } from 'src/apiAndObjects/objects/entities/distribution.model';
import { WebService } from 'src/apiAndObjects/objects/entities/webService.model';
import { ContactPoint } from 'src/apiAndObjects/objects/entities/contactPoint.model';
import { Address, Organization } from 'generated/backofficeSchemas';
import { Operation } from 'src/apiAndObjects/objects/entities/operation.model';
import { inject } from '@angular/core';
import { LogService } from 'src/services/log.service';

export class ApiCaller {
  private headers = new HttpHeaders();
  private logger = inject(LogService);

  /**
   * @param http An HttpClient object used to make the http calls.
   * @param httpCallErrorHandler A handler for post processing of http responses and errors
   * @param baseUrl The base url to append any relative url segments to.
   */
  constructor(private http: HttpClient, private httpCallErrorHandler: HttpResponseHandler, private baseUrl: string) {}

  /**
   * Does an http call using the parameters given
   *
   * @param urlSegments The url as a string or arrray of srtrings that will be joined with '/' characters.
   * @param requestMethod The http request method to use.
   * @param queryParams An object containing key-value pairs that make up the query parameters.
   * @param bodyData The body of the http call.
   * @param headerFilter A function allowing the filtering out of any http headers set, or adding of them for this call only
   */
  public doCall(
    urlSegments: string | Array<string>,
    requestMethod: RequestMethod,
    queryParams: Record<string, string | Array<string>> = {},
    bodyData:
      | Record<string, unknown>
      | FormData
      | Array<unknown>
      | DataProduct
      | ContactPoint
      | Address
      | Organization
      | SavePersonBody
      | Operation
      | SaveUserBody
      | Distribution
      | WebService = {},
    headerFilter?: (headers: HttpHeaders) => HttpHeaders,
  ): Promise<unknown> {
    const url = this.getUrl(urlSegments);
    const options = {
      headers: null != headerFilter ? headerFilter(this.headers) : this.headers,
      params: queryParams,
    };

    let response: Observable<unknown>;
    switch (requestMethod) {
      case RequestMethod.GET:
        response = this.http.get(url, options);
        break;
      case RequestMethod.DELETE:
        // response = this.http.delete(url, options);
        response = this.http.request('DELETE', url, {
          ...options,
          body: bodyData,
        });
        break;
      case RequestMethod.POST:
        response = this.http.post(url, bodyData, options);
        break;
      case RequestMethod.PATCH:
        response = this.http.patch(url, bodyData, options);
        break;
      case RequestMethod.PUT:
        response = this.http.put(url, bodyData, options);
        break;
    }
    if (response != null) {
      return lastValueFrom(response)
        .then((data: unknown) => this.httpCallErrorHandler.handleSuccess(data))
        .catch((res: unknown) => {
          this.logger.error('doCall handleError', res);
          return null != this.httpCallErrorHandler ? this.httpCallErrorHandler.handleError(res) : res;
        });
    }
    return Promise.resolve(null);
  }

  /**
   * Adds an http header that will be added to every call (unless subsequently filtered)
   *
   * @param key Header key
   * @param value Header value
   */
  public addDefaultHeader(key: string, value: string): this {
    this.headers = this.headers.append(key, value);
    return this;
  }

  /**
   * Removes an http header that was previously added
   *
   * @param key Header key
   */
  public removeDefaultHeader(key: string): this {
    this.headers = this.headers.delete(key);
    return this;
  }

  private getUrl(segments: string | Array<string>): string {
    segments = Array.isArray(segments) ? segments : [segments];

    const url = `${this.baseUrl}/${segments.join('/')}`;
    return url;
  }
}
