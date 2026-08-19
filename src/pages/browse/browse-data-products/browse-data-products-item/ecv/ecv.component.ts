import { Component, OnInit } from '@angular/core';
import { DataProduct } from 'generated/backofficeSchemas';
import { ApiService } from 'src/apiAndObjects/api/api.service';
import { WithSubscription } from 'src/helpers/subscription';
import { ActiveUserService } from 'src/services/activeUser.service';
import { EntityExecutionService } from 'src/services/calls/entity-execution.service';
import { LoadingService } from 'src/services/loading.service';
import { StateChangeService } from 'src/services/stateChange.service';
import { Entity } from 'src/utility/enums/entity.enum';
import { Status } from 'src/utility/enums/status.enum';

@Component({
  selector: 'app-ecv',
  templateUrl: './ecv.component.html',
  styleUrl: './ecv.component.scss',
})
export class ECVComponent extends WithSubscription implements OnInit {
  constructor(
    private readonly entityExecutionService: EntityExecutionService,
    private readonly stateChangeService: StateChangeService,
    private readonly apiService: ApiService,
    private readonly loadingService: LoadingService,
    private readonly activeUserService: ActiveUserService,
  ) {
    super();
    if(this.entityExecutionService.getActiveDataProductValue()){
      this.variableMeasured = this.entityExecutionService.getActiveDataProductValue()?.variableMeasured;
    }
    this.allECVs = this.fetchECVs();
    
  }

  public entityEnum = Entity;

  public disabled = false;
  
  public variableMeasured: string [] | undefined = undefined;

  public allECVs: Array<string> | undefined = undefined;

  private initSubscriptions(): void {
    this.subscribe(this.stateChangeService.currentDataProductStateObs, (status: DataProduct['status'] | null) => {
      if (status === null|| (status === Status.SUBMITTED && !this.userHasEditPermissionsForSubmitted()) || status === Status.PUBLISHED || status === Status.ARCHIVED) {
        this.disabled = true;
      }
    });
  }

  public ngOnInit(): void {
    this.initSubscriptions();
  }

  public fetchECVs(){
    let responseArray: Array<string> | undefined = undefined;
    this.apiService.endpoints.ECV.getAll.call()
    .then((response: Array<string>) => {
      if(response.length > 0){
        responseArray = response;
        console.warn('Hello, response getAllECV:', response);
      }
    })
    .catch((error: unknown) => {
      console.error('Error fetching ECVs:', error);
    });
    return responseArray;
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
