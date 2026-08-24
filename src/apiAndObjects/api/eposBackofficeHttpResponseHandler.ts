import { HttpErrorResponse } from '@angular/common/http';
import { Injector } from '@angular/core';
import { SnackbarService } from 'src/services/snackbar.service';
import { ApiResponse } from './apiResponse.interface';
import { AaaiService } from 'src/aaai/aaai.service';

export class EposBackOfficeHttpResponseHandler {
  private readonly notificationsService: SnackbarService;
  private aaaiService: AaaiService;
  constructor(private injector: Injector) {
    this.aaaiService = injector.get(AaaiService);
    this.notificationsService = injector.get<SnackbarService>(SnackbarService);
  }

  public static createMockResponseObject(dataIn: unknown, success = true): Promise<ApiResponse> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (success) {
          resolve({
            data: dataIn,
          } as ApiResponse);
        } else {
          reject('Mock API Error');
        }
      }, 500);
    });
  }

  public handleSuccess(res: ApiResponse, fullResponse = false): Promise<unknown> {
    return new Promise((resolve, reject) => {
      // validate that it has a data attribute
      if (undefined === res) {
        // add a message to be handled by the handleError method
        reject({
          message: 'Internally generated error: No data attribute in api response',
          response: res,
        });
      } else {
        if (fullResponse) {
          // return the full response
          resolve(res);
        } else {
          // return the data element
          resolve(res);
        }
      }
    });
  }

  /*
   * Creates an error for a promise.
   */
  public handleError(res: HttpErrorResponse): Promise<unknown> {
    // TODO: Check response meta
    // TODO: Output to console?
    const body = res.error; // .error is the body of the response?
    let returnValue: ApiResponse;
    let errorMessage = '';

    switch (true) {
      case res.status === 401:
        this.aaaiService.logout();
        break;
      case res.ok === false:
        errorMessage = res.message;
        break;
      case res.status === 404 && typeof body !== 'string':
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        returnValue = body;
        break; // just an empty dataset
      case typeof body !== 'string':
        errorMessage = 'body.msg';
        break;
      default:
        errorMessage = res.message;
        break;
    }
    // console.debug('error message', errorMessage, returnValue, res);

    if (errorMessage) {
      console.error(this.withTimestamp('API access error - '), errorMessage);
      // this.notificationsService.sendNegative('API Error - ', 'A call to retrieve data failed');
      return Promise.reject(errorMessage);
    } else {
      // return Promise.resolve(returnValue);
      return Promise.resolve(null);
    }
  }

  private withTimestamp(message: string): string {
    return `[${new Date().toLocaleString('it-IT', { timeZone: 'Europe/Rome', hour12: false })}] ${message}`;
  }
}
