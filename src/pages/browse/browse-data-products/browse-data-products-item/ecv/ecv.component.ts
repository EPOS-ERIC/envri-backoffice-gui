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

interface EcvListItem {
  uri: string;
  name: string;
  isCustom: boolean;
}

@Component({
  selector: 'app-ecv',
  templateUrl: './ecv.component.html',
  styleUrl: './ecv.component.scss',
})
export class ECVComponent extends WithSubscription implements OnInit {
  public entityEnum = Entity;

  public disabled = false;

  public variableMeasured: string[] = [];

  public selectedVariableMeasured = '';

  public manualVariableMeasured = '';

  public allECVs: Array<EXVSDetailDataSource> = [];

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
      this.variableMeasured = [...new Set(dataProduct?.variableMeasured ?? [])];
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
    if(callResponse.length > 0){
      this.allECVs = [...callResponse] as EXVSDetailDataSource[];
    }
  }

  public onEcvSelectionChange(selectedValue: string): void {
    this.selectedVariableMeasured = selectedValue;
  }

  public addSelectedVariableMeasured(): void {
    this.addVariableMeasured(this.selectedVariableMeasured);
    this.selectedVariableMeasured = '';
  }

  public addManualVariableMeasured(): void {
    const value = this.manualVariableMeasured.trim();
    if (!this.isManualVariableMeasuredValid(value)) {
      return;
    }

    this.addVariableMeasured(value);
    this.manualVariableMeasured = '';
  }

  public removeVariableMeasured(uri: string): void {
    const updated = this.variableMeasured.filter((item) => item !== uri);
    this.persistVariableMeasured(updated);
    if (this.selectedVariableMeasured === uri) {
      this.selectedVariableMeasured = '';
    }
  }

  public getEcvListItem(uri: string): EcvListItem {
    const match = this.allECVs.find((ecv) => ecv.uri === uri);

    return {
      uri,
      name: match?.name ?? 'Manual URI',
      isCustom: !match,
    };
  }

  public isManualVariableMeasuredValid(value = this.manualVariableMeasured): boolean {
    return value.trim().includes('vocab.nerc.ac.uk');
  }

  public get canAddSelectedVariableMeasured(): boolean {
    const value = this.selectedVariableMeasured.trim();
    return value.length > 0 && !this.variableMeasured.includes(value);
  }

  public get canAddManualVariableMeasured(): boolean {
    const value = this.manualVariableMeasured.trim();
    return this.isManualVariableMeasuredValid(value) && value.length > 0 && !this.variableMeasured.includes(value);
  }

  public get hasManualVariableMeasuredError(): boolean {
    return this.manualVariableMeasured.trim().length > 0 && !this.isManualVariableMeasuredValid();
  }

  public get canDisplayVariableMeasuredList(): boolean {
    return this.variableMeasured.length > 0;
  }

  private addVariableMeasured(uri: string): void {
    const normalizedUri = uri.trim();
    if (!normalizedUri || this.variableMeasured.includes(normalizedUri)) {
      return;
    }

    this.persistVariableMeasured([...this.variableMeasured, normalizedUri]);
  }

  private persistVariableMeasured(updatedValue: string[]): void {
    this.variableMeasured = [...new Set(updatedValue)];

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
