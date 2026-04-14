import { Input, Component, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { DataProduct } from 'src/apiAndObjects/objects/entities/dataProduct.model';
import { EntityExecutionService } from 'src/services/calls/entity-execution.service';
import { Status } from 'src/utility/enums/status.enum';
import { SpatialExtentLocationIndexObj } from './spatial-coverage-map/simpleSpatialControl/simpleSpatialControl.component';
import { LinkedEntity, Location } from 'generated/backofficeSchemas';
import { ApiService } from 'src/apiAndObjects/api/api.service';
import { GetLocationParams } from 'src/apiAndObjects/api/location/getLocation';
import { Entity } from 'src/utility/enums/entity.enum';
import { SpatialTemporalEntityExecutionService } from 'src/services/calls/spatial-temporal-entity-execution.service';
import { EntityEndpointValue } from 'src/utility/enums/entityEndpointValue.enum';
import { DialogService } from 'src/components/dialogs/dialog.service';
import { LoadingService } from 'src/services/loading.service';
import { SnackbarService, SnackbarType } from 'src/services/snackbar.service';
import { ActiveUserService } from 'src/services/activeUser.service';

@Component({
  selector: 'app-spatial-coverage',
  templateUrl: './spatial-coverage.component.html',
  styleUrl: './spatial-coverage.component.scss',
})
export class SpatialCoverageComponent implements OnInit {
  @Input() dataProductIsParent = true;
  @Input() mapId!: string;

  public spatialExtent: LinkedEntity[] | undefined = [];
  @Input() set spatialExtentInput(value: Array<LinkedEntity> | undefined) {
    if (value) {
      this.spatialExtent = value;
      this.initSpatialCoverages(this.spatialExtent);
      setTimeout(() => {
        this.snackbarService.openSnackbar(
          `Please save any changes to each Spatial Extent.`,
          'close',
          SnackbarType.WARNING,
          12000,
          ['snackbar', 'mat-toolbar', 'snackbar-warning'],
        );
      }, 500);
    }
  }

  public dataProduct: DataProduct;
  constructor(
    private readonly entityExecutionService: EntityExecutionService,
    private readonly spatialTemporalEntityExecutionService: SpatialTemporalEntityExecutionService,
    private readonly apiService: ApiService,
    private readonly dialogService: DialogService,
    private readonly loadingService: LoadingService,
    private readonly snackbarService: SnackbarService,
    private readonly activeUserService: ActiveUserService
  ) {
    this.dataProduct = this.entityExecutionService.getActiveDataProductValue() as DataProduct;
  }

  private updateMapTimeout?: NodeJS.Timeout;

  public spatialCoverageInput: Array<string | undefined> = [];

  public spatialCoverageChange: Subject<Array<string | undefined>> = new Subject();

  public spatialExtents: Array<Location> = [];

  public disabled = true;

  public ngOnInit(): void {
    let userHasEditPermissionsForSubmitted: boolean | undefined = undefined;
    // check for User Role - if user not an ADMIN or REVIEWER can see the SUBMITTED, but can't edit them
    const activeUser = this.activeUserService.getActiveUser();
    if(activeUser){
      const activeUserGroups = activeUser.groups;
      if(activeUserGroups){
        // find group in UserGroups matching with current active loaded Entity
        const groupMatch = activeUserGroups.find(group => group.groupId === this.dataProduct?.groups?.find(entityGroup => entityGroup === group.groupId));
        if(groupMatch){
          const userRole = groupMatch.role;
          if(userRole && (userRole === 'ADMIN' || userRole === 'REVIEWER')){
            userHasEditPermissionsForSubmitted = true;
          }
          else{
            userHasEditPermissionsForSubmitted = false;
          }
        }
      }
    }
    this.disabled = (this.dataProduct?.status === Status.SUBMITTED && userHasEditPermissionsForSubmitted === false) || this.dataProduct?.status === Status.PUBLISHED || this.dataProduct?.status === Status.ARCHIVED;
  }

  /**
   * The `initSpatialCoverages` function initializes spatial coverages by fetching location data from an
   * API and updating the spatialExtents array and spatialCoverageInput.
   */
  private initSpatialCoverages(spatialCoverages: Array<LinkedEntity>) {
    if (spatialCoverages.length > 0) {
      this.loadingService.setShowSpinner(true);
    }
    spatialCoverages.forEach((location: LinkedEntity) => {
      const params: GetLocationParams = {
        instanceId: location.instanceId as string,
        metaId: location.metaId as string,
      };
      this.apiService.endpoints.Location.get
        .call(params)
        .then((items: Array<Location>) => {
          items.forEach((location) => {
            this.spatialExtents.push(location);
            this.spatialCoverageInput.push(location.location);
          });
          setTimeout(() => {
            this.refreshPointsOnMap();
          }, 100);
        })
        .finally(() => this.loadingService.setShowSpinner(false));
    });
  }

  public newSpatialCoverage() {
    const newSpatialCoverage: Location = {
      location: 'POINT(0 0)',
    };
    this.apiService.endpoints.Location.create.call(newSpatialCoverage).then((newLocation) => {
      this.spatialExtents.push(newLocation);
      this.spatialCoverageInput.push(newLocation.location);

      // Update Global Dataproduct after change to Spatial Extents Arr
      const newLocationEntity: LinkedEntity = {
        instanceId: newLocation.instanceId,
        metaId: newLocation.metaId,
        entityType: Entity.LOCATION.toUpperCase(),
        uid: newLocation.uid,
      };
      if (this.dataProductIsParent) {
        if (null != this.dataProduct) {
          this.dataProduct.spatialExtent?.push(newLocationEntity);
          this.entityExecutionService.setActiveDataProduct(
            this.entityExecutionService.convertToDataProduct(this.dataProduct),
          );
          this.entityExecutionService.handleDataProductSave();
        }
      } else {
        const activeWebService = this.entityExecutionService.getActiveWebServiceValue();
        activeWebService?.spatialExtent?.push(newLocationEntity);
        this.entityExecutionService.setActiveWebService(
          this.entityExecutionService.convertToWebService(activeWebService!),
        );
        this.entityExecutionService.handleWebserviceSave();
      }
      setTimeout(() => {
        this.refreshPointsOnMap();
      }, 100);
    });
  }

  public deleteSpatialCoverage(index: number) {
    // Delete Entity From DB
    this.spatialTemporalEntityExecutionService
      .handleSpatialTemporalDelete(EntityEndpointValue.LOCATION, this.spatialExtents[index].instanceId!)
      .then((success) => {
        if (success) {
          // Remove Inputs from form and coverage from map
          this.spatialCoverageInput.splice(index, 1);
          this.spatialExtents.splice(index, 1);

          // Update Global Dataproduct after change to Spatial Extents Arr
          if (this.dataProductIsParent) {
            if (this.dataProduct) {
              this.dataProduct?.spatialExtent?.splice(index, 1);
              this.entityExecutionService.setActiveDataProduct(
                this.entityExecutionService.convertToDataProduct(this.dataProduct),
              );
              this.entityExecutionService.handleDataProductSave();
            }
          } else {
            // Update Global Webservice
            const activeWebService = this.entityExecutionService.getActiveWebServiceValue();
            if (activeWebService) {
              activeWebService.spatialExtent?.splice(index, 1);
              this.entityExecutionService.setActiveWebService(
                this.entityExecutionService.convertToWebService(activeWebService),
              );
              this.entityExecutionService.handleWebserviceSave();
            }
          }
        }
        setTimeout(() => {
          this.refreshPointsOnMap();
        }, 100);
      });
  }

  public saveSpatialCoverage(index: number) {
    this.spatialTemporalEntityExecutionService.handleSpatialSave(this.spatialExtents[index]);
  }

  /**
   * The function refreshes points on a map by formatting the spatial extent from a string to an object
   * and emitting the location values.
   */
  public refreshPointsOnMap() {
    this.spatialCoverageChange.next(this.spatialCoverageInput);
  }

  /**
   * The function `updateSpatialCoverage` updates the spatial coverage of a location based on the event
   * index and triggers a map refresh after a timeout.
   * @param {SpatialExtentLocationIndexObj} event - The `event` parameter in the `updateSpatialCoverage`
   * function is an object of type `SpatialExtentLocationIndexObj`. It contains two properties:
   */
  public updateSpatialCoverage(event: SpatialExtentLocationIndexObj) {
    this.spatialExtents.forEach((spatialExtent: Location, index) => {
      if (event.index === index) {
        spatialExtent.location = event.location;
        this.spatialCoverageInput[index] = event.location;
      }
    });
    clearTimeout(this.updateMapTimeout);
    this.updateMapTimeout = setTimeout(() => {
      this.refreshPointsOnMap();
    }, 100);
  }

  public handleSpatialHelp(): void {
    this.dialogService.openSpatialCoverageHelpDialog();
  }
}
