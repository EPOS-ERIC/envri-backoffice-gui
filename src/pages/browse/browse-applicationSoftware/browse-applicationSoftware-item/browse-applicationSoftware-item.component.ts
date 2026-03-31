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
import { LinkedEntity, SoftwareApplication } from 'generated/backofficeSchemas';
import { StateChangeService } from 'src/services/stateChange.service';
import { EntityFieldValue } from 'src/utility/enums/entityFieldValue.enum';
import { NavigationService } from 'src/services/navigation.service';
import { SoftwareApplicationForm } from 'src/shared/interfaces/form.interface';
import { WithSubscription } from 'src/helpers/subscription';
import { LoadingService } from 'src/services/loading.service';

@Component({
  selector: 'app-applicationSoftware-item',
  templateUrl: './browse-applicationSoftware-item.component.html',
  styleUrls: ['./browse-applicationSoftware-item.component.scss'],
})
export class BrowseSoftwareApplicationItemComponent extends WithSubscription implements OnInit, OnDestroy {
  @ViewChild(NgScrollbar) scrollable!: NgScrollbar;

  public softwareApplication!: SoftwareApplication;
  public form!: SoftwareApplicationForm;
  public distribution: Array<LinkedEntity> | undefined = [];
  public activeMetaId!: string;
  public activeInstanceId!: string;
  public stateEnum = Status;
  public entityFieldEnum = EntityFieldValue;
  public activeItem: string = '';
  public activeTitle: string = '';
  public thisEntityType = Entity.SOFTWARE_APPLICATION;

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
    this.subscribe(this.navigationService.softwareApplicationActiveItemObs, (id: string) => {
      this.activeItem = id;
    });
    this.subscribe(this.navigationService.softwareApplicationActiveItemTitleObs, (title: string) => {
      this.activeTitle = title;
    });
    this.subscribe(this.stateChangeService.triggerReloadObs, (requiresRefresh: boolean) => {
      if (requiresRefresh) {
        this.initData(this.activeInstanceId, this.activeMetaId);
      }
    });
    this.subscribe(this.actionService.triggerSoftwareApplicationReloadObs, (requiresRefresh: boolean) => {
      if (requiresRefresh) {
        this.initData(this.activeInstanceId, this.activeMetaId);
      }
    });
  }

  public ngOnInit(): void {
    this.helpersService.activeEntityType.next(Entity.SOFTWARE_APPLICATION);
    this.initSubscriptions();
  }

  public override ngOnDestroy(): void {
    this.actionService.cancelLiveEdit();
  }

  private initDataCallback(): void {
    if (this.softwareApplication) {
      this.stateChangeService.setCurrentSoftwareApplicationState(this.softwareApplication.status);
      this.entityExecutionService.setActiveSoftwareApplication(
        this.entityExecutionService.convertToSoftwareApplication(this.softwareApplication),
      );
      this.actionService.setLiveEdit();
      this.initForm();
      this.trackFormData();
      /* this.distribution = this.softwareApplication.distribution; */ // NO DISTRIBUTION ASSOCIATED TO SOFTWARE APPLICATIONS
      if (this.softwareApplication.status === Status.PUBLISHED || this.softwareApplication.status === Status.ARCHIVED) {
        this.form.disable();
      }
    }
  }

  private initData(id: string, metaId: string): void {
    this.loadingService.setShowSpinner(true);
    this.apiService.endpoints[Entity.SOFTWARE_APPLICATION].get
      .call(
        {
          metaId: metaId,
          instanceId: id,
        },
        false,
      )
      .then((data: Array<SoftwareApplication>) => {
        if (Array.isArray(data) && data.length > 0) {
          this.softwareApplication = data.shift() as SoftwareApplication;
          this.initDataCallback();
        }
      })
      .finally(() => this.loadingService.setShowSpinner(false));
  }

  private initForm(): void {
    this.form = this.formBuilder.group({
      instanceId: this.softwareApplication?.instanceId,
      uid: this.softwareApplication?.uid,
      generalInformation: this.formBuilder.group({
        name: new FormControl(this.softwareApplication?.name),
        description: new FormControl(this.softwareApplication?.description),
        keywords: new FormControl(this.softwareApplication?.keywords),
        mainEntityOfPage: new FormControl(this.softwareApplication?.mainEntityOfPage), // TODO: PAY ATTENTION: this is correctly camelCase, while SSC has been miseplled in Backend as "mainEntityofPage" !!!!
        licenseURL: new FormControl(this.softwareApplication?.licenseURL),
        softwareVersion: new FormControl(this.softwareApplication?.softwareVersion),
        downloadURL: new FormControl(this.softwareApplication?.downloadURL),
        operatingSystem: this.formBuilder.array(
          (this.softwareApplication?.operatingSystem ?? []).map((os) => this.formBuilder.control(os)),
        ),
        requirements: new FormControl(this.softwareApplication?.requirements),
        creator: this.formBuilder.array(
          (this.softwareApplication?.creator ?? []).map((creator) => this.formBuilder.control(creator)),
        ),
      }),
      contactPoint: this.formBuilder.array([]),
      publisher: this.softwareApplication?.publisher,
      changeTimestamp: this.softwareApplication?.changeTimestamp,
      state: this.softwareApplication?.status,
    });
  }

  private trackFormData(): void {
    if (this.softwareApplication) {
      let updatingObject = this.entityExecutionService.getActiveSoftwareApplicationValue() || {};
      this.form.valueChanges.pipe(debounceTime(500)).subscribe((changes) => {
        // TODO: hello removed check for 'distribution' length since now distribution property on SoftApp!
        if (this.softwareApplication?.status === Status.DRAFT) {
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
          mainEntityOfPage: changes.generalInformation?.mainEntityOfPage,
          licenseURL: changes.generalInformation?.licenseURL,
          softwareVersion: changes.generalInformation?.softwareVersion,
          downloadURL: changes.generalInformation?.downloadURL,
          operatingSystem: changes.generalInformation?.operatingSystem,
          requirements: changes.generalInformation?.requirements,
          creator: changes.generalInformation?.creator,
        };

        this.entityExecutionService.setActiveSoftwareApplication(updatingObject);
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
        metaId: this.softwareApplication?.metaId,
        type: Entity.SOFTWARE_APPLICATION,
        instanceId: this.softwareApplication?.instanceId,
      },
      '65vw',
      'auto',
      'revisions-dialog',
    );
  }

  public handleDelete(): void {
    if (this.softwareApplication?.instanceId) {
      const toDelete = new Map<string, EntityEndpointValue>();
      toDelete.set(this.softwareApplication.instanceId, EntityEndpointValue.APPLICATION_SOFTWARE);
      this.dialogService.handleDelete(toDelete);
    }
  }

  public handleScrollToTop(): void {
    scrollBackToTop(this.scrollable);
  }
}
