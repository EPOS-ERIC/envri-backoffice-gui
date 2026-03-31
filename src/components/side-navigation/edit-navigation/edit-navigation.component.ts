import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { BehaviorSubject, Subject, filter, takeUntil } from 'rxjs';
import { Status } from 'src/utility/enums/status.enum';
import { ActionsService } from 'src/services/actions.service';
import { IChangeItem } from './edit.interface';
import { Entity } from 'src/utility/enums/entity.enum';
import { EntityEndpointValue } from 'src/utility/enums/entityEndpointValue.enum';
import { EntityExecutionService } from 'src/services/calls/entity-execution.service';
import { Router } from '@angular/router';
import { StateChangeService } from 'src/services/stateChange.service';
import { HelpersService } from 'src/services/helpers.service';
import { DataProduct, SoftwareApplication, SoftwareSourceCode } from 'generated/backofficeSchemas';
import { ActiveUserService } from 'src/services/activeUser.service';

@Component({
  selector: 'app-edit-navigation',
  templateUrl: './edit-navigation.component.html',
  styleUrls: ['./edit-navigation.component.scss'],
})
export class EditNavigationComponent implements OnInit, OnDestroy {
  private activeEntity?: Entity;
  private stop$ = new Subject<void>();
  public itemsExist = new BehaviorSubject<boolean>(false);
  public currentEdit!: IChangeItem;
  public status = Status;
  public activeDataProduct?: DataProduct | null;
  public activeSoftwareApplication?: SoftwareApplication | null;
  public activeSoftwareSourceCode?: SoftwareSourceCode | null;

  constructor(
    public dialog: MatDialog,
    public actionsService: ActionsService,
    private entityExecutionService: EntityExecutionService,
    private router: Router,
    private stateChangeService: StateChangeService,
    private helpersService: HelpersService,
    private activeUserService: ActiveUserService,
  ) {}

  public ngOnInit(): void {
    this.actionsService.initEditedItems();
    this.initWatchers();
  }

  public ngOnDestroy(): void {
    this.stop$.next();
    this.stop$.complete();
  }

  private initWatchers(): void {
    this.actionsService.currentEditObservable
      .pipe(
        filter((item): item is IChangeItem => !!item),
        takeUntil(this.stop$),
      )
      .subscribe((item: IChangeItem) => {
        this.currentEdit = item;
      });
    this.actionsService.editedItemsObservable.pipe(takeUntil(this.stop$)).subscribe((items) => {
      this.itemsExist.next(items.length > 0);
    });
    this.helpersService.activeEntityTypeObs
      .pipe(
        filter((activeEntityType): activeEntityType is Entity => !!activeEntityType),
        takeUntil(this.stop$),
      )
      .subscribe((activeEntityType: Entity) => {
        this.activeEntity = activeEntityType;
      });
    this.entityExecutionService.dataProductObs.pipe(takeUntil(this.stop$)).subscribe((dataProduct) => {
      this.activeDataProduct = dataProduct;
    });
    this.entityExecutionService.softwareApplicationObs.pipe(takeUntil(this.stop$)).subscribe((softwareApplication) => {
      this.activeSoftwareApplication = softwareApplication;
    });
    this.entityExecutionService.softwareSourceCodeObs.pipe(takeUntil(this.stop$)).subscribe((softwareSourceCode) => {
      this.activeSoftwareSourceCode = softwareSourceCode;
    });
  }

  public handleSave(): void {
    switch (this.activeEntity as Entity) {
      case Entity.DATA_PRODUCT: {
        this.entityExecutionService.handleDataProductSave();
        break;
      }
      case Entity.DISTRIBUTION: {
        this.entityExecutionService.handleDistributionSave();
        break;
      }
      case Entity.WEBSERVICE: {
        this.entityExecutionService.handleWebserviceSave();
        break;
      }
      case Entity.SOFTWARE_APPLICATION: {
        this.entityExecutionService.handleSoftwareApplicationSave();
        break;
      }
      case Entity.SOFTWARE_SOURCE_CODE: {
        this.entityExecutionService.handleSoftwareSourceCodeSave();
        break;
      }
    }
  }

  public handleCreateFromPublishedArchivedDiscardedEntity(): void {
    // DataProduct or Distribution
    if (this.activeEntity === Entity.DATA_PRODUCT || this.activeEntity === Entity.DISTRIBUTION) {
      this.entityExecutionService.handleCreateDataProductFromPublishedArchivedDiscardedEntity();
    }
    // SoftwareApplication
    else if (this.activeEntity === Entity.SOFTWARE_APPLICATION) {
      this.entityExecutionService.handleCreateSoftwareApplicationFromPublishedArchivedDiscardedEntity();
    }
    // SoftwareSourceCode
    else if (this.activeEntity === Entity.SOFTWARE_SOURCE_CODE) {
      this.entityExecutionService.handleCreateSoftwareSourceCodeFromPublishedArchivedDiscardedEntity();
    }
  }

  public handleChangeState(status: Status) {
    if (this.activeEntity) {
      this.stateChangeService.handleStateChange(status, this.activeEntity);
    }
  }

  public isActive(id: string): boolean {
    return this.currentEdit && id === this.currentEdit.id;
  }

  public handleClick(id: string, route: EntityEndpointValue): void {
    this.router.navigate([`/browse/${route}/details`, id]);
  }

  get activeEntityGroups(): Array<string> | undefined {
    switch (this.activeEntity) {
      case Entity.DATA_PRODUCT:
        return this.activeDataProduct?.groups;
      case Entity.SOFTWARE_APPLICATION:
        return this.activeSoftwareApplication?.groups;
      case Entity.SOFTWARE_SOURCE_CODE:
        return this.activeSoftwareSourceCode?.groups;
      default:
        return undefined;
    }
  }
  
  // just to mention it out: 'Entity' here referring to "SoftwareApplication", "SoftwareSourceCode" or "DataProduct"
  get activeEntityStatus(): string | undefined {
    switch (this.activeEntity) {
      case Entity.DATA_PRODUCT:
        return this.activeDataProduct?.status;
      case Entity.SOFTWARE_APPLICATION:
        return this.activeSoftwareApplication?.status;
      case Entity.SOFTWARE_SOURCE_CODE:
        return this.activeSoftwareSourceCode?.status;
      default:
        return undefined;
    }
  }

  get userCanPublish(): boolean {
    const activeUser = this.activeUserService.getActiveUser();
    if(activeUser){
      // if user is a "SuperAdmin", allow, no need for further check on role
      if(activeUser.isAdmin){
        return true;
      }

      const activeUserGroups = activeUser.groups;
      if(activeUserGroups){
        // find group in UserGroups matching with current active loaded Entity
        const groupMatch = activeUserGroups.find(group => group.groupId === this.activeEntityGroups?.find(entityGroup => entityGroup === group.groupId));
        if(groupMatch){
          const userRole = groupMatch.role;
          if(userRole === 'ADMIN' || userRole === 'REVIEWER'){
            return true;
          }
          else{
            return false
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

  get activeEntityType(): string {
    switch (this.activeEntity) {
      case Entity.DATA_PRODUCT:
        return Entity.DATA_PRODUCT;
      case Entity.SOFTWARE_APPLICATION:
        return Entity.SOFTWARE_APPLICATION;
      case Entity.SOFTWARE_SOURCE_CODE:
        return Entity.SOFTWARE_SOURCE_CODE;
      default:
        return 'entity';
    }
  }

  get isSubmitDisabled(): boolean {
    if (this.activeEntity === Entity.DATA_PRODUCT) {
      return this.activeDataProduct?.distribution?.length === 0;
    }

    if (this.activeEntity === Entity.SOFTWARE_APPLICATION) {
      return !this.activeSoftwareApplication;
    }
    if (this.activeEntity === Entity.SOFTWARE_SOURCE_CODE) {
      // TODO: check here !
      return !this.activeSoftwareSourceCode;
    }

    return true;
  }
}
