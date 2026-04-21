import { Injectable } from '@angular/core';
import { Entity } from 'src/utility/enums/entity.enum';
import { Status } from 'src/utility/enums/status.enum';
import { ApiService } from 'src/apiAndObjects/api/api.service';
import { SnackbarService, SnackbarType } from '../snackbar.service';
import { ActionsService } from '../actions.service';
import { Router } from '@angular/router';
import { EntityEndpointValue } from 'src/utility/enums/entityEndpointValue.enum';
import { EntityStateManager } from './entityStateManager';
import { LoadingService } from '../loading.service';
import {
  DataProduct,
  Distribution,
  LinkedEntity,
  Mapping,
  Operation,
  SoftwareApplication,
  SoftwareSourceCode,
  WebService,
} from 'generated/backofficeSchemas';

@Injectable({
  providedIn: 'root',
})
export class EntityExecutionService extends EntityStateManager {
  constructor(
    private readonly apiService: ApiService,
    private readonly snackbarService: SnackbarService,
    private readonly actionsService: ActionsService,
    private readonly router: Router,
    private readonly loadingService: LoadingService,
  ) {
    super();
  }

  /**
   * The `handleDataProductSave` function updates or creates a draft of a data product and performs
   * various actions based on the result.
   */
  public handleDataProductSave(): void {
    const activeDataProduct = this.getActiveDataProductValue();
    if (null != activeDataProduct) {
      if (activeDataProduct.status === Status.DRAFT || activeDataProduct.status === Status.SUBMITTED) {
        this.loadingService.setShowSpinner(true);
        this.apiService.endpoints[Entity.DATA_PRODUCT].update
          .call({
            ...activeDataProduct,
          })
          .then((data: DataProduct) => {
            this.snackbarService.openSnackbar(
              'Successfully updated Data Product.',
              'Close',
              SnackbarType.SUCCESS,
              3000,
              ['snackbar', 'mat-toolbar', 'snackbar-success'],
            );
            this.actionsService.disableSave();
            if (!this.actionsService.itemExists(data.instanceId as string)) {
              // this.actionsService.addEditedItems([
              //   {
              //     type: Entity.DATA_PRODUCT,
              //     route: EntityEndpointValue.DATA_PRODUCT,
              //     label: 'Data product',
              //     state: Status.DRAFT,
              //     color: 'draft',
              //     id: data.instanceId,
              //   },
              // ]);
              this.actionsService.saveCurrentEdit(data.instanceId as string);
            }

            // Timeout for more consistent navigation
            setTimeout(() => {
              this.router.navigate([
                `/browse/${EntityEndpointValue.DATA_PRODUCT}/details`,
                data.metaId,
                data.instanceId,
              ]);
            }, 100);
          })
          .catch((err) => {
            console.error(err);
            this.snackbarService.openSnackbar('Error updating draft.', 'Close', SnackbarType.ERROR, 3000, [
              'snackbar',
              'mat-toolbar',
              'snackbar-error',
            ]);
          })
          .finally(() => {
            this.loadingService.setShowSpinner(false);
          });
      } else {
        this.loadingService.setShowSpinner(true);
        this.apiService.endpoints[Entity.DATA_PRODUCT].update
          .call({
            ...activeDataProduct,
            status: Status.DRAFT,
            instanceChangedId: activeDataProduct.instanceId,
          })
          .then((data: DataProduct) => {
            this.snackbarService.openSnackbar('Successfully created new draft.', 'Close', SnackbarType.SUCCESS, 3000, [
              'snackbar',
              'mat-toolbar',
              'snackbar-success',
            ]);
            this.actionsService.disableSave();
            this.actionsService.addEditedItems([
              {
                type: Entity.DATA_PRODUCT,
                route: EntityEndpointValue.DATA_PRODUCT,
                label: 'Data product',
                status: Status.DRAFT,
                color: 'draft',
                id: data.instanceId as string,
              },
            ]);
            this.actionsService.saveCurrentEdit(data.instanceId as string);
          })
          .catch((err) => {
            console.error(err);
            this.snackbarService.openSnackbar('Error creating new draft', 'Close', SnackbarType.ERROR, 3000, [
              'snackbar',
              'mat-toolbar',
              'snackbar-error',
            ]);
          })
          .finally(() => {
            this.loadingService.setShowSpinner(false);
          });
      }
    }
  }

  public handleSoftwareApplicationSave(): void {
    const activeSoftwareApplication = this.getActiveSoftwareApplicationValue();
    if (null != activeSoftwareApplication) {
      if (activeSoftwareApplication.status === Status.DRAFT || activeSoftwareApplication.status === Status.SUBMITTED) {
        this.loadingService.setShowSpinner(true);
        this.apiService.endpoints[Entity.SOFTWARE_APPLICATION].update
          .call({
            ...activeSoftwareApplication,
          })
          .then((data: SoftwareApplication) => {
            this.snackbarService.openSnackbar(
              'Successfully updated Software Application.',
              'Close',
              SnackbarType.SUCCESS,
              3000,
              ['snackbar', 'mat-toolbar', 'snackbar-success'],
            );
            this.actionsService.disableSave();
            if (!this.actionsService.itemExists(data.instanceId as string)) {
              this.actionsService.addEditedItems([
                {
                  type: Entity.SOFTWARE_APPLICATION,
                  route: EntityEndpointValue.APPLICATION_SOFTWARE,
                  label: 'Software Application',
                  status: Status.DRAFT, // TO be double-checked: is the property 'status' or 'state'?
                  color: 'draft',
                  id: data.instanceId as string,
                },
              ]);
              this.actionsService.saveCurrentEdit(data.instanceId as string);
            }

            // Timeout for more consistent navigation
            setTimeout(() => {
              this.router.navigate([
                `/browse/${EntityEndpointValue.APPLICATION_SOFTWARE}/details`,
                data.metaId,
                data.instanceId,
              ]);
            }, 100);
          })
          .catch((err) => {
            console.error(err);
            this.snackbarService.openSnackbar('Error updating draft.', 'Close', SnackbarType.ERROR, 3000, [
              'snackbar',
              'mat-toolbar',
              'snackbar-error',
            ]);
          })
          .finally(() => {
            this.loadingService.setShowSpinner(false);
          });
      } else {
        this.loadingService.setShowSpinner(true);
        this.apiService.endpoints[Entity.SOFTWARE_APPLICATION].update
          .call({
            ...activeSoftwareApplication,
            status: Status.DRAFT,
            instanceChangedId: activeSoftwareApplication.instanceId,
          })
          .then((data: SoftwareApplication) => {
            this.snackbarService.openSnackbar('Successfully created new draft.', 'Close', SnackbarType.SUCCESS, 3000, [
              'snackbar',
              'mat-toolbar',
              'snackbar-success',
            ]);
            this.actionsService.disableSave();
            this.actionsService.addEditedItems([
              {
                type: Entity.SOFTWARE_APPLICATION,
                route: EntityEndpointValue.APPLICATION_SOFTWARE,
                label: 'Software application',
                status: Status.DRAFT,
                color: 'draft',
                id: data.instanceId as string,
              },
            ]);
            this.actionsService.saveCurrentEdit(data.instanceId as string);
          })
          .catch((err) => {
            console.error(err);
            this.snackbarService.openSnackbar('Error creating new draft', 'Close', SnackbarType.ERROR, 3000, [
              'snackbar',
              'mat-toolbar',
              'snackbar-error',
            ]);
          })
          .finally(() => {
            this.loadingService.setShowSpinner(false);
          });
      }
    }
  }

  public handleSoftwareSourceCodeSave(): void {
    const activeSoftwareSourceCode = this.getActiveSoftwareSourceCodeValue();
    if (null != activeSoftwareSourceCode) {
      if (activeSoftwareSourceCode.status === Status.DRAFT || activeSoftwareSourceCode.status === Status.SUBMITTED) {
        this.loadingService.setShowSpinner(true);
        this.apiService.endpoints[Entity.SOFTWARE_SOURCE_CODE].update
          .call({
            ...activeSoftwareSourceCode,
          })
          .then((data: SoftwareSourceCode) => {
            this.snackbarService.openSnackbar(
              'Successfully updated Software Source Code.',
              'Close',
              SnackbarType.SUCCESS,
              3000,
              ['snackbar', 'mat-toolbar', 'snackbar-success'],
            );
            this.actionsService.disableSave();
            if (!this.actionsService.itemExists(data.instanceId as string)) {
              this.actionsService.addEditedItems([
                {
                  type: Entity.SOFTWARE_SOURCE_CODE,
                  route: EntityEndpointValue.SOFTWARE_SOURCE_CODE,
                  label: 'Software Source Code',
                  status: Status.DRAFT, // TO be double-checked: is the property 'status' or 'state'?
                  color: 'draft',
                  id: data.instanceId as string,
                },
              ]);
              this.actionsService.saveCurrentEdit(data.instanceId as string);
            }

            // Timeout for more consistent navigation
            setTimeout(() => {
              this.router.navigate([
                `/browse/${EntityEndpointValue.SOFTWARE_SOURCE_CODE}/details`,
                data.metaId,
                data.instanceId,
              ]);
            }, 100);
          })
          .catch((err) => {
            console.error(err);
            this.snackbarService.openSnackbar('Error updating draft.', 'Close', SnackbarType.ERROR, 3000, [
              'snackbar',
              'mat-toolbar',
              'snackbar-error',
            ]);
          })
          .finally(() => {
            this.loadingService.setShowSpinner(false);
          });
      } else {
        this.loadingService.setShowSpinner(true);
        this.apiService.endpoints[Entity.SOFTWARE_SOURCE_CODE].update
          .call({
            ...activeSoftwareSourceCode,
            status: Status.DRAFT,
            instanceChangedId: activeSoftwareSourceCode.instanceId,
          })
          .then((data: SoftwareSourceCode) => {
            this.snackbarService.openSnackbar('Successfully created new draft.', 'Close', SnackbarType.SUCCESS, 3000, [
              'snackbar',
              'mat-toolbar',
              'snackbar-success',
            ]);
            this.actionsService.disableSave();
            this.actionsService.addEditedItems([
              {
                type: Entity.SOFTWARE_SOURCE_CODE,
                route: EntityEndpointValue.SOFTWARE_SOURCE_CODE,
                label: 'Software Source Code',
                status: Status.DRAFT,
                color: 'draft',
                id: data.instanceId as string,
              },
            ]);
            this.actionsService.saveCurrentEdit(data.instanceId as string);
          })
          .catch((err) => {
            console.error(err);
            this.snackbarService.openSnackbar('Error creating new draft', 'Close', SnackbarType.ERROR, 3000, [
              'snackbar',
              'mat-toolbar',
              'snackbar-error',
            ]);
          })
          .finally(() => {
            this.loadingService.setShowSpinner(false);
          });
      }
    }
  }

  public handleWebserviceSave(): void {
    const activeWebservice = this.getActiveWebServiceValue();
    if (activeWebservice !== null) {
      activeWebservice.dateModified = '';
      if (activeWebservice.status !== Status.DRAFT) {
        activeWebservice.status = Status.DRAFT;
        activeWebservice.instanceChangedId = activeWebservice.instanceId;
      }
      this.loadingService.setShowSpinner(true);
      this.apiService.endpoints[Entity.WEBSERVICE].update
        .call({
          ...activeWebservice,
        })
        .then((data: WebService) => {
          this.snackbarService.openSnackbar('Successfully updated Webservice.', 'Close', SnackbarType.SUCCESS, 3000, [
            'snackbar',
            'mat-toolbar',
            'snackbar-success',
          ]);
          if (!this.actionsService.itemExists(data.instanceId as string)) {
            this.actionsService.addEditedItems([
              {
                type: Entity.WEBSERVICE,
                route: EntityEndpointValue.WEBSERVICE,
                label: 'Webservice',
                status: Status.DRAFT,
                color: 'draft',
                id: data.instanceId as string,
              },
            ]);
            this.actionsService.saveCurrentEdit(data.instanceId as string);
          }
        })
        .catch((err) => {
          console.error(err);
          this.snackbarService.openSnackbar('Error updating Webservice.', 'Close', SnackbarType.ERROR, 3000, [
            'snackbar',
            'mat-toolbar',
            'snackbar-error',
          ]);
        })
        .finally(() => {
          this.loadingService.setShowSpinner(false);
        });
    }
  }

  public handleDistributionSave(): Promise<boolean> {
    const promise = new Promise<boolean>((resolve) => {
      const activeDistribution: Distribution = this.getActiveDistributionValue() as Distribution;
      if (activeDistribution) {
        activeDistribution.modified = new Date().toISOString();
        if (activeDistribution.status !== Status.DRAFT) {
          activeDistribution.status = Status.DRAFT;
          activeDistribution.instanceChangedId = activeDistribution.instanceId;
        }
        this.loadingService.setShowSpinner(true);
        this.apiService.endpoints[Entity.DISTRIBUTION].update
          .call(
            {
              ...activeDistribution,
            },
            false,
          )
          .then((data: Distribution) => {
            this.snackbarService.openSnackbar(
              'Successfully updated Distribution.',
              'Close',
              SnackbarType.SUCCESS,
              3000,
              ['snackbar', 'mat-toolbar', 'snackbar-success'],
            );
            this.actionsService.showSaveDistributionMessage(false);
            if (!this.actionsService.itemExists(data.instanceId as string)) {
              this.actionsService.addEditedItems([
                {
                  type: Entity.DISTRIBUTION,
                  route: EntityEndpointValue.DISTRIBUTION,
                  label: 'Distribution',
                  status: Status.DRAFT,
                  color: 'draft',
                  id: data.instanceId as string,
                },
              ]);
              this.actionsService.saveCurrentEdit(data.instanceId as string);
            }
            resolve(true);
          })
          .catch((err) => {
            console.error(err);
            this.snackbarService.openSnackbar('Error updating Distribution.', 'Close', SnackbarType.ERROR, 3000, [
              'snackbar',
              'mat-toolbar',
              'snackbar-error',
            ]);
            resolve(false);
          })
          .finally(() => {
            this.loadingService.setShowSpinner(false);
          });
      }
    });
    return promise;
  }

  public handleOperationSave(): void {
    const operationData = this.getActiveOperationValue();
    if (operationData !== null) {
      if (operationData.status !== Status.DRAFT) {
        operationData.status = Status.DRAFT;
        operationData.instanceChangedId = operationData.instanceId;
      }
      this.loadingService.setShowSpinner(true);
      this.apiService.endpoints[Entity.OPERATION].update
        .call({
          ...operationData,
        })
        .then((data: Operation) => {
          this.handleMappingArrSave();
          this.snackbarService.openSnackbar('Successfully updated Operation.', 'Close', SnackbarType.SUCCESS, 3000, [
            'snackbar',
            'mat-toolbar',
            'snackbar-success',
          ]);
          const activeWebservice = this.webService.getValue();
          const newOperation: LinkedEntity = {
            entityType: Entity.OPERATION,
            instanceId: data.instanceId,
            metaId: data.metaId,
            uid: data.uid,
          };
          if (null != activeWebservice) {
            activeWebservice.supportedOperation = [];
            activeWebservice.supportedOperation.push(newOperation);
            this.setActiveWebService(activeWebservice);
          }

          // Sets 'accessURL' on Distribution to newly created Operation.
          const activeDistribution = this.getActiveDistributionValue();
          if (activeDistribution != null) {
            activeDistribution.accessURL = [];
            
            // save the operation in the Distribution instance as well
            activeDistribution.supportedOperation = [];
            activeDistribution.supportedOperation.push(newOperation);
            this.handleDistributionSave();

            // activeDistribution?.accessURL?.push(newOperation);
            this.setActiveDistribution(activeDistribution);
          }
        })
        .catch((err) => {
          console.error(err);
          this.snackbarService.openSnackbar('Error updating Operation.', 'Close', SnackbarType.ERROR, 3000, [
            'snackbar',
            'mat-toolbar',
            'snackbar-error',
          ]);
        })
        .finally(() => {
          this.loadingService.setShowSpinner(false);
        });
    }
  }

  public handleCreateDataProduct(): void {
    const item: DataProduct = {
      uid: 'temp-uid-to-be-generated',
      modified: '',
      created: '',
    };

    this.loadingService.setShowSpinner(true);
    this.apiService.endpoints.DataProduct.create
      .call(item)
      .then((value: DataProduct) => {
        this.router.navigate([`/browse/${EntityEndpointValue.DATA_PRODUCT}/details`, value.metaId, value.instanceId]);
        this.snackbarService.openSnackbar(`Success: ${value.uid} created`, 'close', SnackbarType.SUCCESS, 6000, [
          'snackbar',
          'mat-toolbar',
          'snackbar-success',
        ]);
        this.actionsService.addEditedItems([
          {
            type: Entity.DATA_PRODUCT,
            route: EntityEndpointValue.DATA_PRODUCT,
            label: 'Data product',
            status: Status.DRAFT,
            color: 'draft',
            id: value.instanceId as string,
          },
        ]);
        this.actionsService.saveCurrentEdit(value.instanceId as string);
      })
      .catch(() =>
        this.snackbarService.openSnackbar(
          `Error: failed to create new Data Product`,
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

  public handleCreateDataProductFromPublishedArchivedDiscardedEntity(): void {
    const publishedOrArchivedEntity = this.getActiveDataProductValue();

    if (publishedOrArchivedEntity) {
      // publishedOrArchivedEntity.instanceChangedId = publishedOrArchivedEntity.instanceId;
      // publishedOrArchivedEntity.instanceId = undefined; // Handled by backend
      publishedOrArchivedEntity.status = Status.DRAFT;

      this.loadingService.setShowSpinner(true);
      this.apiService.endpoints.DataProduct.create
        .call(publishedOrArchivedEntity)
        .then((value: DataProduct) => {
          this.snackbarService.openSnackbar(`Success: ${value.uid} created`, 'View', SnackbarType.SUCCESS, 6000, [
            'snackbar',
            'mat-toolbar',
            'snackbar-success',
          ]);
          this.router.navigate(['/browse/dataproduct/details', value.metaId, value.instanceId]);
          this.actionsService.addEditedItems([
            {
              type: Entity.DATA_PRODUCT,
              route: EntityEndpointValue.DATA_PRODUCT,
              label: 'Data product',
              status: Status.DRAFT,
              color: 'draft',
              id: value.instanceId as string,
            },
          ]);
          this.actionsService.saveCurrentEdit(value.instanceId as string);
        })
        .catch(() =>
          this.snackbarService.openSnackbar(
            `Error: failed to create new Data Product`,
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
  }

  public handleCreateSoftwareApplicationFromPublishedArchivedDiscardedEntity(): void {
    const publishedOrArchivedEntity = this.getActiveSoftwareApplicationValue();

    if (publishedOrArchivedEntity) {
      // publishedOrArchivedEntity.instanceChangedId = publishedOrArchivedEntity.instanceId;
      // publishedOrArchivedEntity.instanceId = undefined; // Handled by backend
      publishedOrArchivedEntity.status = Status.DRAFT;

      this.loadingService.setShowSpinner(true);
      this.apiService.endpoints.SoftwareApplication.create
        .call(publishedOrArchivedEntity)
        .then((value: SoftwareApplication) => {
          this.snackbarService.openSnackbar(`Success: ${value.uid} created`, 'View', SnackbarType.SUCCESS, 6000, [
            'snackbar',
            'mat-toolbar',
            'snackbar-success',
          ]);
          this.router.navigate(['/browse/softwareapplication/details', value.metaId, value.instanceId]);
          this.actionsService.addEditedItems([
            {
              type: Entity.SOFTWARE_APPLICATION,
              route: EntityEndpointValue.APPLICATION_SOFTWARE,
              label: 'Software Application',
              status: Status.DRAFT,
              color: 'draft',
              id: value.instanceId as string,
            },
          ]);
          this.actionsService.saveCurrentEdit(value.instanceId as string);
        })
        .catch(() =>
          this.snackbarService.openSnackbar(
            `Error: failed to create new SoftwareApplication`,
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
  }

  public handleCreateSoftwareSourceCodeFromPublishedArchivedDiscardedEntity(): void {
    const publishedOrArchivedEntity = this.getActiveSoftwareSourceCodeValue();

    if (publishedOrArchivedEntity) {
      // publishedOrArchivedEntity.instanceChangedId = publishedOrArchivedEntity.instanceId;
      // publishedOrArchivedEntity.instanceId = undefined; // Handled by backend
      publishedOrArchivedEntity.status = Status.DRAFT;

      this.loadingService.setShowSpinner(true);
      this.apiService.endpoints.SoftwareSourceCode.create
        .call(publishedOrArchivedEntity)
        .then((value: SoftwareSourceCode) => {
          this.snackbarService.openSnackbar(`Success: ${value.uid} created`, 'View', SnackbarType.SUCCESS, 6000, [
            'snackbar',
            'mat-toolbar',
            'snackbar-success',
          ]);
          this.router.navigate(['/browse/softwaresourcecode/details', value.metaId, value.instanceId]);
          this.actionsService.addEditedItems([
            {
              type: Entity.SOFTWARE_SOURCE_CODE,
              route: EntityEndpointValue.SOFTWARE_SOURCE_CODE,
              label: 'Software Source Code',
              status: Status.DRAFT,
              color: 'draft',
              id: value.instanceId as string,
            },
          ]);
          this.actionsService.saveCurrentEdit(value.instanceId as string);
        })
        .catch(() =>
          this.snackbarService.openSnackbar(
            `Error: failed to create new SoftwareSourceCode`,
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
  }

  public handleMappingArrSave() {
    this.loadingService.setShowSpinner(true);
    const requests: Promise<Mapping>[] = [];
    this.mapping.getValue().forEach((item: Mapping) => {
      item.status = Status.DRAFT;
      requests.push(this.apiService.endpoints[Entity.MAPPING].update.call(item));
    });
    Promise.all(requests)
      .then(() => {
        this.snackbarService.openSnackbar(`Success: Parameters Saved`, 'close', SnackbarType.SUCCESS, 6000, [
          'snackbar',
          'mat-toolbar',
          'snackbar-success',
        ]);
      })
      .catch(() =>
        this.snackbarService.openSnackbar(`Error: failed to Save Parameters`, 'close', SnackbarType.ERROR, 6000, [
          'snackbar',
          'mat-toolbar',
          'snackbar-error',
        ]),
      )
      .finally(() => this.loadingService.setShowSpinner(false));
  }
}
