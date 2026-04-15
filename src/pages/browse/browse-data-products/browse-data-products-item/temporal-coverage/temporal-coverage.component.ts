/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, Input } from '@angular/core';
import { FormGroup, FormControl, FormArray, Validators, UntypedFormArray } from '@angular/forms';
import { DataProduct, LinkedEntity, PeriodOfTime, WebService } from 'generated/backofficeSchemas';
// eslint-disable-next-line import/named
import moment, { Moment } from 'moment';
import { EntityExecutionService } from 'src/services/calls/entity-execution.service';
import { debounceTime } from 'rxjs';
import { ApiService } from 'src/apiAndObjects/api/api.service';
import { GetPeriodOfTimeParams } from 'src/apiAndObjects/api/periodOfTime/getPeriodOfTime';
import { SpatialTemporalEntityExecutionService } from 'src/services/calls/spatial-temporal-entity-execution.service';
import { Status } from 'src/utility/enums/status.enum';
import { LoadingService } from 'src/services/loading.service';
import { Entity } from 'src/utility/enums/entity.enum';
import { EntityEndpointValue } from 'src/utility/enums/entityEndpointValue.enum';
import { StateChangeService } from 'src/services/stateChange.service';
import { SnackbarService, SnackbarType } from 'src/services/snackbar.service';
import { ActiveUserService } from 'src/services/activeUser.service';

@Component({
  selector: 'app-temporal-coverage',
  templateUrl: './temporal-coverage.component.html',
  styleUrl: './temporal-coverage.component.scss',
})
export class TemporalCoverageComponent {
  public dataProdActiveParent!: boolean;
  @Input() set dataProductIsParent(value: boolean) {
    this.dataProdActiveParent = value;
  }
  public activeDataproduct = this.entityExecutionService.getActiveDataProductValue() as DataProduct;
  public parentEntity!: DataProduct | WebService;
  @Input() set parent(value: DataProduct | WebService) {
    if (this.dataProdActiveParent) {
      this.parentEntity = this.entityExecutionService.getActiveDataProductValue() as DataProduct;
    } else {
      this.parentEntity = this.entityExecutionService.getActiveWebServiceValue() as WebService;
    }
    if (null != value.temporalExtent) {
      this.temporalLinkedEntities = value.temporalExtent;
      this.initTemporalCoverage(value.temporalExtent);
    } else {
      // Set as empty array if null to enable code to push into temporal extent arr when updating
      this.parentEntity.temporalExtent = [];
    }
  }

  public STATUS = Status;

  public temporalLinkedEntities: LinkedEntity[] = [];

  private startDate!: Moment | null;

  private endDate!: Moment | null;

  public form!: FormGroup;

  private readonly temporalExtents: Array<PeriodOfTime> = [];

  constructor(
    private readonly entityExecutionService: EntityExecutionService,
    private readonly apiService: ApiService,
    private readonly spatialTemporalEntityExecutionService: SpatialTemporalEntityExecutionService,
    private readonly loadingService: LoadingService,
    private readonly stateChangeService: StateChangeService,
    private readonly snackbarService: SnackbarService,
    private readonly activeUserService: ActiveUserService,
  ) {}

  private initTemporalCoverage(temporalExent: LinkedEntity[]) {
    this.startDate = null;
    this.endDate = null;

    temporalExent.forEach((periodOfTime: LinkedEntity) => {
      const params: GetPeriodOfTimeParams = {
        singleOptionOnly: true,
        instanceId: periodOfTime.instanceId as string,
        metaId: periodOfTime.metaId as string,
      };
      this.loadingService.setShowSpinner(true);
      this.apiService.endpoints.PeriodOfTime.get
        .call(params)
        .then((items: Array<PeriodOfTime>) => {
          this.temporalExtents.push(items[0]);
          this.startDate = moment(items[0].startDate);
          this.endDate = moment(items[0].endDate);
          this.form = new FormGroup({
            coverage: this.createCoverageArray(items),
          });
          this.trackFormChanges();
          this.initSubscriptions();
        })
        .finally(() => this.loadingService.setShowSpinner(false));
    });
    setTimeout(() => {
      this.snackbarService.openSnackbar(
        `Please save any changes to the Temporal Extent.`,
        'close',
        SnackbarType.WARNING,
        12000,
        ['snackbar', 'mat-toolbar', 'snackbar-warning'],
      );
    }, 500);
  }

  public userHasEditPermissionsForSubmitted(): boolean{
    // check for User Role - if user not an ADMIN or REVIEWER can see the SUBMITTED, but can't edit them
    const activeUser = this.activeUserService.getActiveUser();
    if(activeUser){
      const activeUserGroups = activeUser.groups;
      if(activeUserGroups){
        // find group in UserGroups matching with current active loaded Entity
        const groupMatch = activeUserGroups.find(group => group.groupId === this.parentEntity?.groups?.find(entityGroup => entityGroup === group.groupId));
        if(groupMatch){
          const userRole = groupMatch.role;
          if(userRole && (userRole === 'ADMIN' || userRole === 'REVIEWER')){
            return true;
          }
          else{
            return false;
          }
        }
        else{
          return false;
        }
      }
      else{
        return false;
      }
    }
    else{
      return false;
    }
  }

  private initSubscriptions() {
    this.stateChangeService.currentDataProductStateObs.subscribe((state: DataProduct['status'] | null) => {
      if (state == null || (state === Status.SUBMITTED && !this.userHasEditPermissionsForSubmitted()) || state === Status.PUBLISHED || state === Status.ARCHIVED || state === Status.DISCARDED) {
        this.form.disable();
      } else {
        this.form.enable();
      }
    });
  }

  private trackFormChanges(): void {
    this.form.valueChanges.pipe(debounceTime(500)).subscribe((changes) => {
      this.startDate = changes.coverage[0].startDate;
      this.endDate = changes.coverage[0].endDate;

      /* The code snippet is checking if the start date is before the end date in the form. Returns an error on the GUI if so. */
      if (this.comparisonValidator(this.startDate, this.endDate)) {
        this.form.setErrors(null);
        this.form.markAsTouched();
      } else {
        this.form.setErrors({ incorrect: true });
        this.form.markAsPristine();
      }
    });
  }

  private comparisonValidator(start: Moment | null, end: Moment | null): boolean {
    const startCtrl = moment(start);
    const endCtrl = moment(end);
    if (startCtrl && endCtrl) {
      if (startCtrl.isAfter(endCtrl)) {
        return false;
      }
    }
    return true;
  }

  private createCoverageArray(temporalExtent?: PeriodOfTime[] | undefined): UntypedFormArray {
    const arr = new UntypedFormArray([]);
    if (temporalExtent) {
      temporalExtent?.forEach((item) => {
        arr.push(
          new FormGroup({
            startDate: new FormControl(item?.startDate, [Validators.required]),
            endDate: new FormControl(item?.endDate),
          }),
        );
      });
    } else {
      arr.push(
        new FormGroup({
          startDate: new FormControl('', [Validators.required]),
          endDate: new FormControl(''),
        }),
      );
    }
    return arr;
  }

  public handleSave(index?: number) {
    const extentToUpdate = this.temporalExtents[index!];
    extentToUpdate.startDate = this.startDate ? moment(this.startDate).toISOString() : '';
    extentToUpdate.endDate = this.endDate ? moment(this.endDate).toISOString() : '';
    this.spatialTemporalEntityExecutionService.handleTemporalSave(extentToUpdate);
  }

  public createNewTemporalExtent() {
    this.loadingService.setShowSpinner(true);
    this.apiService.endpoints.PeriodOfTime.create
      .call()
      .then((temporalCoverage: PeriodOfTime) => {
        const newEntity: LinkedEntity = {
          entityType: Entity.PERIOD_OF_TIME,
          instanceId: temporalCoverage.instanceId,
          metaId: temporalCoverage.metaId,
          uid: temporalCoverage.uid,
        };
        if (this.dataProdActiveParent) {
          const parentDataProduct = this.parentEntity as DataProduct;
          parentDataProduct.temporalExtent?.push(newEntity);
          this.entityExecutionService.setActiveDataProduct(parentDataProduct);
          this.entityExecutionService.handleDataProductSave();
        } else {
          const parentWebservice = this.parentEntity as WebService;
          parentWebservice?.temporalExtent?.push(newEntity);
          this.entityExecutionService.setActiveWebService(parentWebservice);
          this.entityExecutionService.handleWebserviceSave();
        }
        this.initTemporalCoverage([newEntity]);
      })
      .finally(() => this.loadingService.setShowSpinner(false));
  }

  public handleDelete(index: number) {
    // Delete Entity From DB
    this.spatialTemporalEntityExecutionService
      .handleSpatialTemporalDelete(EntityEndpointValue.PERIOD_OF_TIME, this.temporalExtents[index].instanceId!)
      .then((success) => {
        if (success) {
          // Remove Inputs from form and coverage
          this.temporalExtents.splice(index, 1);
          this.temporalLinkedEntities.splice(index, 1);
          (this.form.get('coverage') as UntypedFormArray).removeAt(index);
          // Update Global Dataproduct after change to Spatial Extents Arr
          if (this.dataProductIsParent) {
            const activeDataproduct = this.entityExecutionService.getActiveDataProductValue();
            if (activeDataproduct) {
              activeDataproduct.spatialExtent?.splice(index, 1);
              this.entityExecutionService.setActiveDataProduct(
                this.entityExecutionService.convertToDataProduct(activeDataproduct),
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
      });
  }

  public dateComparison(): (group: FormControl) => { [key: string]: any } | null {
    return (group: FormControl): { [key: string]: any } | null => {
      const startCtrl = group.get('startDate');
      const endCtrl = group.get('endDate');
      if (startCtrl?.value && endCtrl?.value) {
        if (moment(startCtrl.value).isAfter(endCtrl.value)) {
          startCtrl.markAsTouched();
          endCtrl.markAsTouched();
          return {
            dates: 'Start date needs to be before end date.',
          };
        }
      }
      return null;
    };
  }

  public getControls(field: string) {
    return (this.form.get(field) as FormArray).controls;
  }
}
