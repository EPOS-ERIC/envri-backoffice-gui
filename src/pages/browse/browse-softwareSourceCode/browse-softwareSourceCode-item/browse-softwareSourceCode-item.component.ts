import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormControl, UntypedFormBuilder } from '@angular/forms';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { ApiService } from 'src/apiAndObjects/api/api.service';
import { DialogService } from 'src/components/dialogs/dialog.service';
import { DialogRevisionsComponent } from 'src/components/dialogs/dialog-revisions/dialog-revisions.component';
import { ActionsService } from 'src/services/actions.service';
import { PersistorService, StorageType } from 'src/services/persistor.service';
import { StorageKey } from 'src/utility/enums/storageKey.enum';
import { Entity } from 'src/utility/enums/entity.enum';
import { HelpersService } from 'src/services/helpers.service';
import { EntityEndpointValue } from 'src/utility/enums/entityEndpointValue.enum';
import { EntityExecutionService } from 'src/services/calls/entity-execution.service';
import { debounceTime } from 'rxjs';
import { NgScrollbar } from 'ngx-scrollbar';
import { scrollBackToTop } from 'src/helpers/scroll';
import { Status } from 'src/utility/enums/status.enum';
import { LinkedEntity, SoftwareSourceCode } from 'generated/backofficeSchemas';
import { StateChangeService } from 'src/services/stateChange.service';
import { EntityFieldValue } from 'src/utility/enums/entityFieldValue.enum';
import { NavigationService } from 'src/services/navigation.service';
import { SoftwareSourceCodeForm } from 'src/shared/interfaces/form.interface';
import { WithSubscription } from 'src/helpers/subscription';
import { LoadingService } from 'src/services/loading.service';
import { ActiveUserService } from 'src/services/activeUser.service';

@Component({
  selector: 'app-softwaresourcecode-item',
  templateUrl: './browse-softwareSourceCode-item.component.html',
  styleUrls: ['./browse-softwareSourceCode-item.component.scss'],
})
export class BrowseSoftwareSourceCodeItemComponent extends WithSubscription implements OnInit, OnDestroy {
  @ViewChild(NgScrollbar) scrollable!: NgScrollbar;

  public softwareSourceCode!: SoftwareSourceCode;
  public form!: SoftwareSourceCodeForm;
  public distribution: Array<LinkedEntity> | undefined = [];
  public activeMetaId!: string;
  public activeInstanceId!: string;
  public stateEnum = Status;
  public entityFieldEnum = EntityFieldValue;
  public activeItem: string = '';
  public activeTitle: string = '';

  constructor(
    private readonly dialogService: DialogService,
    private readonly actionService: ActionsService,
    private readonly formBuilder: UntypedFormBuilder,
    private readonly route: ActivatedRoute,
    private readonly apiService: ApiService,
    private readonly persistorService: PersistorService,
    private readonly actionsService: ActionsService,
    private readonly entityExecutionService: EntityExecutionService,
    private readonly stateChangeService: StateChangeService,
    private readonly helpersService: HelpersService,
    private readonly navigationService: NavigationService,
    private readonly loadingService: LoadingService,
    private readonly activeUserService: ActiveUserService
  ) {
    super();
  }

  private initSubscriptions(): void {
    this.subscribe(this.route.paramMap, (obs: ParamMap) => {
      if (null != obs.get('id') && null != obs.get('metaId')) {
        this.activeInstanceId = obs.get('id') as string;
        this.activeMetaId = obs.get('metaId') as string;
        this.initData(this.activeInstanceId, this.activeMetaId);
      }
    });
    this.subscribe(this.navigationService.softwareSourceCodeActiveItemObs, (id: string) => {
      this.activeItem = id;
    });
    this.subscribe(this.navigationService.softwareSourceCodeActiveItemTitleObs, (title: string) => {
      this.activeTitle = title;
    });
    this.subscribe(this.stateChangeService.triggerReloadObs, (requiresRefresh: boolean) => {
      if (requiresRefresh) {
        this.initData(this.activeInstanceId, this.activeMetaId);
      }
    });
    this.subscribe(this.actionService.triggerSoftwareSourceCodeReloadObs, (requiresRefresh: boolean) => {
      if (requiresRefresh) {
        this.initData(this.activeInstanceId, this.activeMetaId);
      }
    });
  }

  public ngOnInit(): void {
    this.helpersService.activeEntityType.next(Entity.SOFTWARE_SOURCE_CODE);
    this.initSubscriptions();
  }

  public override ngOnDestroy(): void {
    this.actionService.cancelLiveEdit();
  }

  private initDataCallback(): void {
    let userHasEditPermissionsForSubmitted: boolean | undefined = false;
    if (this.softwareSourceCode) {
      this.stateChangeService.setCurrentSoftwareSourceCodeState(this.softwareSourceCode.status);
      this.entityExecutionService.setActiveSoftwareSourceCode(
        this.entityExecutionService.convertToSoftwareSourceCode(this.softwareSourceCode),
      );
      this.actionService.setLiveEdit();
      this.initForm();
      this.trackFormData();
      // check for User Role - if user not an ADMIN or REVIEWER can see the SUBMITTED, but can't edit them
      const activeUser = this.activeUserService.getActiveUser();
      if(activeUser){
        const activeUserGroups = activeUser.groups;
        if(activeUserGroups){
          // find group in UserGroups matching with current active loaded Entity
          const groupMatch = activeUserGroups.find(group => group.groupId === this.softwareSourceCode?.groups?.find(entityGroup => entityGroup === group.groupId));
          if(groupMatch){
            const userRole = groupMatch.role;
            console.warn('userRole', userRole);
            if(userRole && (userRole === 'ADMIN' || userRole === 'REVIEWER')){
              userHasEditPermissionsForSubmitted = true;
            }
            else{
              userHasEditPermissionsForSubmitted = false;
            }
          }
        }
      }
      if ((this.softwareSourceCode.status === Status.SUBMITTED && !userHasEditPermissionsForSubmitted) || this.softwareSourceCode.status === Status.PUBLISHED || this.softwareSourceCode.status === Status.ARCHIVED) {
        this.form.disable();
      }
    }
  }

  private initData(id: string, metaId: string): void {
    this.loadingService.setShowSpinner(true);
    this.apiService.endpoints[Entity.SOFTWARE_SOURCE_CODE].get
      .call(
        {
          metaId: metaId,
          instanceId: id,
        },
        false,
      )
      .then((data: Array<SoftwareSourceCode>) => {
        if (Array.isArray(data) && data.length > 0) {
          this.softwareSourceCode = data.shift() as SoftwareSourceCode;
          this.initDataCallback();
        }
      })
      .finally(() => this.loadingService.setShowSpinner(false));
  }

  private initForm(): void {
    this.form = this.formBuilder.group({
      instanceId: this.softwareSourceCode?.instanceId,
      uid: this.softwareSourceCode?.uid,
      generalInformation: this.formBuilder.group({
        name: new FormControl(this.softwareSourceCode?.name),
        description: new FormControl(this.softwareSourceCode?.description),
        keywords: new FormControl(this.softwareSourceCode?.keywords),
        mainEntityOfPage: new FormControl(this.softwareSourceCode?.mainEntityofPage),
        licenseURL: new FormControl(this.softwareSourceCode?.licenseURL),
        softwareVersion: new FormControl(this.softwareSourceCode?.softwareVersion),
        downloadURL: new FormControl(this.softwareSourceCode?.downloadURL),
        programmingLanguage: this.formBuilder.array(
          (this.softwareSourceCode?.programmingLanguage ?? []).map((lang) => this.formBuilder.control(lang)),
        ),
        softwareRequirements: new FormControl(this.softwareSourceCode?.softwareRequirements),
        runtimePlatform: new FormControl(this.softwareSourceCode?.runtimePlatform),
        creator: this.formBuilder.array(
          (this.softwareSourceCode?.creator ?? []).map((creator) => this.formBuilder.control(creator)),
        ),
      }),
      contactPoint: this.formBuilder.array([]),
      publisher: this.softwareSourceCode?.publisher,
      changeTimestamp: this.softwareSourceCode?.changeTimestamp,
      state: this.softwareSourceCode?.status,
    });
  }

  private trackFormData(): void {
    if (this.softwareSourceCode) {
      let updatingObject = this.entityExecutionService.getActiveSoftwareSourceCodeValue() || {};
      this.form.valueChanges.pipe(debounceTime(500)).subscribe((changes) => {
        // TODO: it was a check with distribution.length === 0, no meaning in keeping it since no distribution here?
        if (this.softwareSourceCode?.status === Status.DRAFT) {
          this.actionsService.disableSave();
        }

        if (this.form.valid) {
          this.actionsService.enableSave();
        } else {
          this.actionsService.disableSave();
        }

        updatingObject = {
          ...updatingObject,
          uid: changes.uid,
          name: changes.generalInformation?.name,
          description: changes.generalInformation?.description as string,
          keywords: changes.generalInformation?.keywords,
          mainEntityofPage: changes.generalInformation?.mainEntityOfPage,
          licenseURL: changes.generalInformation?.licenseURL,
          softwareVersion: changes.generalInformation?.softwareVersion,
          downloadURL: changes.generalInformation?.downloadURL,
          programmingLanguage: changes.generalInformation?.programmingLanguage,
          softwareRequirements: changes.generalInformation?.softwareRequirements,
          runtimePlatform: changes.generalInformation?.runtimePlatform,
          creator: changes.generalInformation?.creator,
        };

        this.entityExecutionService.setActiveSoftwareSourceCode(updatingObject);
        this.persistorService.setValueInStorage(
          StorageType.LOCAL_STORAGE,
          StorageKey.FORM_DATA,
          JSON.stringify(updatingObject),
        );
      });
    }
  }

  public handleGetRevisions(): void {
    this.dialogService.openDialogForComponent(
      DialogRevisionsComponent,
      {
        metaId: this.softwareSourceCode?.metaId,
        type: Entity.SOFTWARE_SOURCE_CODE,
        instanceId: this.softwareSourceCode?.instanceId,
      },
      '65vw',
      'auto',
      'revisions-dialog',
    );
  }

  public handleDelete(): void {
    if (this.softwareSourceCode?.instanceId) {
      const toDelete = new Map<string, EntityEndpointValue>();
      toDelete.set(this.softwareSourceCode?.instanceId, EntityEndpointValue.SOFTWARE_SOURCE_CODE);
      this.dialogService.handleDelete(toDelete);
    }
  }

  public handleScrollToTop(): void {
    scrollBackToTop(this.scrollable);
  }
}
