import { Component, Input, OnInit } from '@angular/core';
import { ContactPoint, LinkedEntity, SoftwareSourceCode } from 'generated/backofficeSchemas';
import { ApiService } from 'src/apiAndObjects/api/api.service';
import { WithSubscription } from 'src/helpers/subscription';
import { ActiveUserService } from 'src/services/activeUser.service';
import { EntityExecutionService } from 'src/services/calls/entity-execution.service';
import { LoadingService } from 'src/services/loading.service';
import { SnackbarService, SnackbarType } from 'src/services/snackbar.service';
import { StateChangeService } from 'src/services/stateChange.service';
import { Entity } from 'src/utility/enums/entity.enum';
import { Status } from 'src/utility/enums/status.enum';

@Component({
  selector: 'app-contact-point-sourceCode',
  templateUrl: './contact-point-sourceCode.component.html',
  styleUrl: './contact-point-sourceCode.component.scss',
})
export class ContactPointSourceCodeComponent extends WithSubscription implements OnInit {
  constructor(
    private readonly entityExecutionService: EntityExecutionService,
    private readonly apiService: ApiService,
    private readonly snackbarService: SnackbarService,
    private readonly stateChangeService: StateChangeService,
    private readonly loadingService: LoadingService,
    private readonly activeUserService: ActiveUserService,
  ) {
    super();
  }

  @Input() contactPoint: Array<LinkedEntity> | undefined = undefined;

  public entityEnum = Entity;

  public contactPointDetails!: Promise<ContactPoint[]>[];

  public disabled = false;

  public addedContactPointDetail: ContactPoint | undefined;

  private getContactPointDetails(): void {
    const requests: Promise<ContactPoint[]>[] = [];
    this.contactPoint?.forEach((item: LinkedEntity) => {
      requests.push(
        this.apiService.endpoints[Entity.CONTACT_POINT].get.call(
          {
            metaId: item.metaId as string,
            instanceId: item.instanceId as string,
          },
          false,
        ),
      );
    });
    this.contactPointDetails = requests;
  }

  private initSubscriptions(): void {
    this.subscribe(
      this.stateChangeService.currentSoftwareSourceCodeStateObs,
      (status: SoftwareSourceCode['status'] | null) => {
        if (status === null || (status === Status.SUBMITTED && !this.userHasEditPermissionsForSubmitted()) || status === Status.PUBLISHED || status === Status.ARCHIVED) {
          this.disabled = true;
        }
      },
    );
  }

  public userHasEditPermissionsForSubmitted(): boolean{
    // check for User Role - if user not an ADMIN or REVIEWER can see the SUBMITTED, but can't edit them
    const softwareSourceCode = this.entityExecutionService.getActiveSoftwareSourceCodeValue();
    const activeUser = this.activeUserService.getActiveUser();
    if(activeUser){
      const activeUserGroups = activeUser.groups;
      if(activeUserGroups){
        // find group in UserGroups matching with current active loaded Entity
        const groupMatch = activeUserGroups.find(group => group.groupId === softwareSourceCode?.groups?.find(entityGroup => entityGroup === group.groupId));
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

  public ngOnInit(): void {
    this.initSubscriptions();
    this.syncContactPointsFromActiveSoftwareSourceCode();
    this.getContactPointDetails();
  }

  private syncContactPointsFromActiveSoftwareSourceCode(): void {
    const activeSoftwareSourceCode = this.entityExecutionService.getActiveSoftwareSourceCodeValue();
    if (!activeSoftwareSourceCode?.contactPoint) {
      return;
    }

    this.contactPoint = [...activeSoftwareSourceCode.contactPoint];
  }

  public updateContactPointArray(newContactPointDetails: Array<LinkedEntity>) {
    const softwareSourceCode = this.entityExecutionService.getActiveSoftwareSourceCodeValue();
    this.contactPoint = newContactPointDetails;
    if (null != softwareSourceCode) {
      softwareSourceCode.contactPoint = this.contactPoint;
      this.entityExecutionService.setActiveSoftwareSourceCode(softwareSourceCode);
    }
  }

  public handleAddedContactPointDetail(contactPoint: ContactPoint): void {
    this.addedContactPointDetail = { ...contactPoint };
  }

  public handleUnlinkContactPoint(contactPoint: ContactPoint): void {
    const removedInstanceId = contactPoint?.instanceId;

    if (!removedInstanceId) {
      return;
    }

    const softwareSourceCode = this.entityExecutionService.getActiveSoftwareSourceCodeValue();
    if (softwareSourceCode == null) {
      return;
    }

    const updatedContactPoints = (softwareSourceCode.contactPoint ?? []).filter(
      (item: LinkedEntity) => item.instanceId !== removedInstanceId,
    );

    softwareSourceCode.contactPoint = updatedContactPoints;
    this.entityExecutionService.setActiveSoftwareSourceCode(softwareSourceCode);
    this.contactPoint = updatedContactPoints;

    this.snackbarService.openSnackbar(`Please save.`, 'close', SnackbarType.WARNING, 3000, [
      'snackbar',
      'mat-toolbar',
      'snackbar-warning',
    ]);
  }

  public onLoadingChanged(isLoading: boolean): void {
    this.loadingService.setShowSpinner(isLoading);
  }
}
