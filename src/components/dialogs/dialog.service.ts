import { ComponentType } from '@angular/cdk/portal';
import { Injectable } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { BehaviorSubject } from 'rxjs';
import { DialogDeleteComponent } from 'src/components/dialogs/dialog-delete/dialog-delete.component';
import { DialogMetadataFileViewComponent } from 'src/components/dialogs/dialog-metadata-file-view/dialog-metadata-file-view.component';
import { BaseDialogService, DialogData } from './baseDialogService.abstract';
import { DialogUserPermissionsComponent } from './dialog-user-permissions/dialog-user-permissions.component';
import { ApiService } from 'src/apiAndObjects/api/api.service';
import { SnackbarService, SnackbarType } from 'src/services/snackbar.service';
import { Router } from '@angular/router';
import { EntityEndpointValue } from 'src/utility/enums/entityEndpointValue.enum';
import { ActionsService } from 'src/services/actions.service';
import { DialogWebserviceAddOperationComponent } from './dialog-webservice-add-operation/dialog-webservice-add-operation.component';
import { DialogAddNewParameterComponent } from './dialog-add-new-parameter/dialog-add-new-parameter.component';
import { DialogConfirmComponent, ConfirmationDataIn } from './dialog-confirm/dialog-confirm.component';
import { LoadingService } from 'src/services/loading.service';
import { DialogChangeCommentComponent } from './dialog-change-comment/dialog-change-comment.component';
import { DialogSpatialCoverageHelpComponent } from './dialog-spatial-coverage-help/dialog-spatial-coverage-help.component';
import { LinkedEntity, User, Operation, Group } from 'generated/backofficeSchemas';
import { DialogUserStatusComponent } from './dialog-user-status/dialog-user-status.component';

@Injectable({
  providedIn: 'root',
})
export class DialogService extends BaseDialogService {
  private dialogRef!: MatDialogRef<unknown>;
  private dialogState = new BehaviorSubject<string>('');
  public dialogStateObservable = this.dialogState.asObservable();

  constructor(
    public override dialog: MatDialog,
    private apiService: ApiService,
    private snackbarService: SnackbarService,
    private router: Router,
    private actionsService: ActionsService,
    private loadingService: LoadingService,
  ) {
    super(dialog);
  }

  public setRef(ref: MatDialogRef<unknown>): void {
    this.dialogRef = ref;
  }

  public getRef(): MatDialogRef<unknown> {
    return this.dialogRef;
  }

  public closeDialog(): void {
    this.getRef().close();
  }

  public openDialogForComponent<T = unknown>(
    contentComponent: ComponentType<unknown>,
    data?: T,
    width = '35vw',
    height = 'auto',
    panelClass?: string,
  ): Promise<DialogData<T>> {
    return this.openDialog('anyDialog', contentComponent, true, data, {
      width,
      height,
      panelClass,
    });
  }

  public openConfirmationDialog(
    messageHtml = 'Confirm action',
    closable = false,
    confirmButtonTheme = 'primary',
  ): Promise<boolean> {
    return this.openDialog('confirm', DialogConfirmComponent, closable, {
      messageHtml: messageHtml,
      confirmButtonTheme: confirmButtonTheme,
    } as ConfirmationDataIn).then((data: DialogData<ConfirmationDataIn>) => {
      return data?.dataOut;
    });
  }

  public openMetadataViewDialog(): Promise<DialogData> {
    return this.openDialog('metadataView', DialogMetadataFileViewComponent);
  }

  public openChangeUserRoleDialog(userData: {
    user: User;
    group: Group | null;
    statusType: string;
  }): Promise<DialogData> {
    return this.openDialog(
      'changeUserRole',
      DialogUserPermissionsComponent,
      false,
      userData,
      { width: '400px' },
      'user-permissions',
    );
  }

  public openAddNewParameterDialog(): Promise<DialogData> {
    return this.openDialog('addNewParam', DialogAddNewParameterComponent, false, null, {});
  }

  public openSpatialCoverageHelpDialog(): Promise<DialogData> {
    return this.openDialog('spatialCoverageHelp', DialogSpatialCoverageHelpComponent, true, null, {});
  }

  public handleDelete(entitiesToDelete: Map<string, EntityEndpointValue>, redirect = true): Promise<boolean> {
    return new Promise((resolve) => {
      this.openDialog('delete', DialogDeleteComponent, false, {})
        .then((response: DialogData) => {
          if (response.dataOut === 'delete') {
            this.loadingService.setShowSpinner(true);
            const deletionPromises: Promise<void>[] = [];
            let routeToNavigateBack = '';
            for (const [instanceId, entityEndpointValue] of entitiesToDelete.entries()) {
              // find main Entity to which to navigate back to
              switch(entityEndpointValue){
                case (EntityEndpointValue.DISTRIBUTION):
                case (EntityEndpointValue.DATA_PRODUCT):
                  routeToNavigateBack = EntityEndpointValue.DATA_PRODUCT;
                  break;
                case (EntityEndpointValue.APPLICATION_SOFTWARE):
                  routeToNavigateBack = EntityEndpointValue.APPLICATION_SOFTWARE; 
                  break
                case (EntityEndpointValue.SOFTWARE_SOURCE_CODE):
                  routeToNavigateBack = EntityEndpointValue.SOFTWARE_SOURCE_CODE;
                  break
                default:
                  break;
              }
              deletionPromises.push(
                this.apiService
                .deleteEntity(entityEndpointValue, instanceId)
                .then(() => {
                  this.snackbarService.openSnackbar(
                    `Successfully deleted entity: ${instanceId}`,
                    'Close',
                    SnackbarType.SUCCESS,
                    3000,
                    ['snackbar', 'mat-toolbar', 'snackbar-success'],
                  );
                  this.actionsService.deleteEditedItem(instanceId);
  
                  return resolve(true);
                })
                .catch((err) => {
                  console.error(err);
                  this.snackbarService.openSnackbar('Error deleting entity.', 'Close', SnackbarType.ERROR, 3000, [
                    'snackbar',
                    'mat-toolbar',
                    'snackbar-error',
                  ]);
                })
              );
              
            }
            Promise.allSettled(deletionPromises).finally(() => {
              this.loadingService.setShowSpinner(false);
              if (redirect && routeToNavigateBack !== '') {
                this.router.navigate([`/browse/${routeToNavigateBack}`]);
              } else {
                // reload the entity: at the moment DP/Dist only one calling this function with 'redirect === false'
                switch(routeToNavigateBack){
                  case (EntityEndpointValue.DISTRIBUTION):
                  case (EntityEndpointValue.DATA_PRODUCT):
                    this.actionsService.triggerDataProductReload();
                    break;
                }
              }
            });
          } else {
            return resolve(false);
          }
        })
        .catch((err) => console.error(err));
    });
  }

  /**
   * The function `handleAddWebserviceOperation` opens a dialog to add a new webservice operation,
   * creates the operation using an API call, and returns a promise with the operation details.
   * @param {EntityDetail} webserviceEntityDetail - The `webserviceEntityDetail` parameter is an object
   * that contains details about a webservice entity. It is used as a parameter to open a dialog and also
   * passed as a property to the `WebserviceAddOperationComponent` component.
   * @returns a Promise that resolves to either an Operation object or an unknown value.
   */
  public handleAddWebserviceOperation(webserviceEntityDetail: LinkedEntity): Promise<Operation | unknown> {
    const promise = new Promise((resolve) => {
      this.openDialog('addWebserviceOperation', DialogWebserviceAddOperationComponent, false, {
        webservice: webserviceEntityDetail,
      }).then((response: DialogData) => {
        if (response.dataOut.action === 'add') {
          this.loadingService.setShowSpinner(true);
          this.apiService.endpoints.Operation.create
            .call()
            .then((value: Operation) => {
              this.snackbarService.openSnackbar(
                `Please click 'Save Distribution' to complete this action.`,
                'close',
                SnackbarType.WARNING,
                6000,
                ['snackbar', 'mat-toolbar', 'snackbar-warning'],
              );
              resolve(value);
            })
            .catch(() =>
              this.snackbarService.openSnackbar(
                `Error: failed to create new operation`,
                'close',
                SnackbarType.ERROR,
                6000,
                ['snackbar', 'mat-toolbar', 'snackbar-error'],
              ),
            )
            .finally(() => {
              this.loadingService.setShowSpinner(false);
            });
        }
      });
    });
    return promise;
  }

  public handleUpdateChangeComment(changeComment: string): Promise<DialogData> {
    return this.openDialog(
      'changeCommentDialog',
      DialogChangeCommentComponent,
      false,
      changeComment,
      {},
      'user-permissions',
    );
  }

  public openUpdateStatusDialog(currentStatus: string): Promise<DialogData<string, string | undefined>> {
    return this.openDialog(
      'userStatusDialog',
      DialogUserStatusComponent,
      true,
      currentStatus,
      { width: '400px' },
      'user-status',
    );
  }
}
