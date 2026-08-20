import { Component, OnInit } from '@angular/core';
import { DataProduct } from 'generated/backofficeSchemas';
import { ApiService } from 'src/apiAndObjects/api/api.service';
import { EXVSDetailDataSource } from 'src/apiAndObjects/objects/data-source/exvsDetailDataSource';
import { WithSubscription } from 'src/helpers/subscription';
import { ActiveUserService } from 'src/services/activeUser.service';
import { EntityExecutionService } from 'src/services/calls/entity-execution.service';
import { LoadingService } from 'src/services/loading.service';
import { StateChangeService } from 'src/services/stateChange.service';
import { DataproductService } from '../../dataproduct.service';
import { ActionsService } from 'src/services/actions.service';
import { Entity } from 'src/utility/enums/entity.enum';
import { Status } from 'src/utility/enums/status.enum';

@Component({
  selector: 'app-ecv',
  templateUrl: './ecv.component.html',
  styleUrl: './ecv.component.scss',
})
export class ECVComponent extends WithSubscription implements OnInit {
  public entityEnum = Entity;

  public disabled = false;

  public variableMeasured: string[] | undefined = undefined;

  public selectedVariableMeasured = '';

  public allECVs: Array<EXVSDetailDataSource> | undefined = undefined;

  constructor(
    private readonly entityExecutionService: EntityExecutionService,
    private readonly stateChangeService: StateChangeService,
    private readonly apiService: ApiService,
    private readonly loadingService: LoadingService,
    private readonly activeUserService: ActiveUserService,
    private readonly dataProductService: DataproductService,
    private readonly actionsService: ActionsService,
  ) {
    super();
  }

  private initSubscriptions(): void {
    this.subscribe(this.entityExecutionService.dataProductObs, (dataProduct) => {
      this.variableMeasured = dataProduct?.variableMeasured;
      this.selectedVariableMeasured = this.variableMeasured?.[0] ?? '';
      console.warn('The set VariableMeasured:', this.variableMeasured);
    });

    this.subscribe(this.stateChangeService.currentDataProductStateObs, (status: DataProduct['status'] | null) => {
      if (status === null|| (status === Status.SUBMITTED && !this.userHasEditPermissionsForSubmitted()) || status === Status.PUBLISHED || status === Status.ARCHIVED) {
        this.disabled = true;
      }
    });
  }

  public ngOnInit(): void {
    this.initSubscriptions();
    void this.fetchECVs();
  }

  public async fetchECVs(){
    const callResponse = await this.apiService.endpoints.ECV.getAll.call(); 
    console.warn('Hello, response getAllECV:', callResponse);
    if(callResponse.length > 0){
      this.allECVs = []  as EXVSDetailDataSource[];
      callResponse.forEach((ecv: EXVSDetailDataSource)=>{
        this.allECVs?.push(ecv as EXVSDetailDataSource);
      })
    }
  }

  public onEcvSelectionChange(selectedValue: string): void {
    this.selectedVariableMeasured = selectedValue;
    this.variableMeasured = selectedValue ? [selectedValue] : [];

    const activeDataProduct = this.entityExecutionService.getActiveDataProductValue();
    if (activeDataProduct != null) {
      this.dataProductService.updateDataProductRecord(activeDataProduct, {
        variableMeasured: this.variableMeasured,
      });
      this.actionsService.enableSave();
    }
  }



  public userHasEditPermissionsForSubmitted(): boolean{
    // check for User Role - if user not an ADMIN or REVIEWER can see the SUBMITTED, but can't edit them
    const dataProduct = this.entityExecutionService.getActiveDataProductValue();
    const activeUser = this.activeUserService.getActiveUser();
    if(activeUser){
      const activeUserGroups = activeUser.groups;
      if(activeUserGroups){
        // find group in UserGroups matching with current active loaded Entity
        const groupMatch = activeUserGroups.find(group => group.groupId === dataProduct?.groups?.find(entityGroup => entityGroup === group.groupId));
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

  public onLoadingChanged(isLoading: boolean): void {
    this.loadingService.setShowSpinner(isLoading);
  }
}
