import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { DataProduct } from 'generated/backofficeSchemas';
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
}

interface EcvLResponse {
  '@context': object;
  '@graph': Array<{
    '@id': string;
    '@type': string;
    'skos:prefLabel': skosPrefLabel;
  }>;
}

interface skosPrefLabel {
  '@language': string;
  '@value': string;
}

const normalizeEcvUri = (value: string): string => value.trim().replace(/^http:\/\//i, 'https://').replace(/\/$/, '');

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

  public allECVs = new Map<string, string>();

  public ecvsLoaded = false;

  public ecvsLoading = false;

  constructor(
    private readonly entityExecutionService: EntityExecutionService,
    private readonly stateChangeService: StateChangeService,
    private readonly http: HttpClient,
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

  public async fetchECVs(): Promise<void> {
    if (this.ecvsLoaded) {
      return;
    }

    this.ecvsLoading = true;

    try {
      const callResponse = await firstValueFrom(
        this.http.get<EcvLResponse>('https://vocab.nerc.ac.uk/collection/EXV/current/?_profile=nvs&_mediatype=application/ld+json'),
      );

      const nextMap = new Map<string, string>();
      if (Array.isArray(callResponse?.['@graph'])) {
        callResponse['@graph'].forEach((item) => {
          const uri = item['@id'];
          const name = item['skos:prefLabel']?.['@value'];
          if (uri && name) {
            nextMap.set(normalizeEcvUri(uri), name);
          }
        });
      }

      this.allECVs = nextMap;
      this.ecvsLoaded = true;
    } finally {
      this.ecvsLoading = false;
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
    const normalizedUri = normalizeEcvUri(uri);

    return {
      uri,
      name: this.allECVs.get(normalizedUri) ?? 'Custom URI',
    };
  }

  public get ecvOptions(): EcvListItem[] {
    return [...this.allECVs.entries()].map(([uri, name]) => ({ uri, name }));
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
