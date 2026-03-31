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
import { DataProduct, LinkedEntity } from 'generated/backofficeSchemas';
import { StateChangeService } from 'src/services/stateChange.service';
import { EntityFieldValue } from 'src/utility/enums/entityFieldValue.enum';
import { NavigationService } from 'src/services/navigation.service';
import { DataProductForm } from 'src/shared/interfaces/form.interface';
import { WithSubscription } from 'src/helpers/subscription';
import { LoadingService } from 'src/services/loading.service';
import { ActiveUserService } from 'src/services/activeUser.service';

@Component({
  selector: 'app-browse-data-products-item',
  templateUrl: './browse-data-products-item.component.html',
  styleUrls: ['./browse-data-products-item.component.scss'],
})
export class BrowseDataProductsItemComponent extends WithSubscription implements OnInit, OnDestroy {
  @ViewChild(NgScrollbar) scrollable!: NgScrollbar;

  public dataProduct!: DataProduct | undefined;
  public form!: DataProductForm;
  public distribution: Array<LinkedEntity> | undefined = [];
  public activeMetaId!: string;
  public activeInstanceId!: string;
  public stateEnum = Status;
  public entityFieldEnum = EntityFieldValue;
  public activeItem: string = '';
  public activeTitle: string = '';
  public canManageCategories: boolean = false;

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
    private readonly activeUserService: ActiveUserService,
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
    this.subscribe(this.navigationService.dataProductActiveItemObs, (id: string) => {
      this.activeItem = id;
    });
    this.subscribe(this.navigationService.dataProductActiveItemTitleObs, (title: string) => {
      this.activeTitle = title;
    });
    this.subscribe(this.stateChangeService.triggerReloadObs, (requiresRefresh: boolean) => {
      if (requiresRefresh) {
        this.initData(this.activeInstanceId, this.activeMetaId);
      }
    });
    this.subscribe(this.actionService.triggerDataProductReloadObs, (requiresRefresh: boolean) => {
      if (requiresRefresh) {
        this.initData(this.activeInstanceId, this.activeMetaId);
      }
    });
    this.subscribe(this.route.queryParamMap, (params: ParamMap) => {
      this.canManageCategories = params.get('manageCategories') === 'true';
    });
  }

  public ngOnInit(): void {
    this.helpersService.activeEntityType.next(Entity.DATA_PRODUCT);
    this.initSubscriptions();
  }

  public override ngOnDestroy(): void {
    this.actionService.cancelLiveEdit();
  }

  private initDataCallback(): void {
    let userHasEditPermissionsForSubmitted: boolean | undefined = false;
    if (this.dataProduct) {
      this.stateChangeService.setCurrentDataProductState(this.dataProduct.status);
      this.entityExecutionService.setActiveDataProduct(
        this.entityExecutionService.convertToDataProduct(this.dataProduct),
      );
      this.actionService.setLiveEdit();
      this.initForm();
      this.trackFormData();
      this.distribution = this.dataProduct.distribution;
      // check for User Role - if user not an ADMIN or REVIEWER can see the SUBMITTED, but can't edit them
      const activeUser = this.activeUserService.getActiveUser();
      if(activeUser){
        const activeUserGroups = activeUser.groups;
        if(activeUserGroups){
          // find group in UserGroups matching with current active loaded Entity
          const groupMatch = activeUserGroups.find(group => group.groupId === this.dataProduct?.groups?.find(entityGroup => entityGroup === group.groupId));
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
      if ((this.dataProduct.status === Status.SUBMITTED && userHasEditPermissionsForSubmitted === false) || this.dataProduct.status === Status.PUBLISHED || this.dataProduct.status === Status.ARCHIVED) {
        this.form.disable();
      }
    }
  }

  private initData(id: string, metaId: string): void {
    this.loadingService.setShowSpinner(true);
    this.apiService.endpoints[Entity.DATA_PRODUCT].get
      .call(
        {
          metaId: metaId,
          instanceId: id,
        },
        false,
      )
      .then((data: Array<DataProduct>) => {
        if (Array.isArray(data) && data.length > 0) {
          this.dataProduct = data.shift();
          this.initDataCallback();
        }
      })
      .finally(() => this.loadingService.setShowSpinner(false));
  }

  private initForm(): void {
    this.form = this.formBuilder.group({
      instanceId: this.dataProduct?.instanceId,
      uid: this.dataProduct?.uid,
      generalInformation: this.formBuilder.group({
        title: new FormControl(this.dataProduct?.title),
        description: new FormControl(this.dataProduct?.description),
        keywords: new FormControl(this.dataProduct?.keywords),
        versionInfo: new FormControl(this.dataProduct?.versionInfo),
        accrualPeriodicity: new FormControl(this.dataProduct?.accrualPeriodicity),
        type: new FormControl(this.dataProduct?.type),
        issued: new FormControl(this.dataProduct?.issued),
        created: new FormControl(this.dataProduct?.created),
        modified: new FormControl(this.dataProduct?.modified),
        qualityAssurance: new FormControl(this.dataProduct?.qualityAssurance),
      }),
      distribution: this.formBuilder.array([]),
      contactPoint: this.formBuilder.array([]),
      publisher: this.dataProduct?.publisher,
      changeTimestamp: this.dataProduct?.changeTimestamp,
      state: this.dataProduct?.status,
    });
  }

  private trackFormData(): void {
    if (this.dataProduct) {
      let updatingObject = this.entityExecutionService.getActiveDataProductValue() || {};
      this.form.valueChanges.pipe(debounceTime(500)).subscribe((changes) => {
        if (this.dataProduct?.status === Status.DRAFT && changes.distribution?.length === 0) {
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
          title: this.helpersService.formatArrayVal(changes.generalInformation?.title),
          description: this.helpersService.formatArrayVal(changes.generalInformation?.description),
          keywords: changes.generalInformation?.keywords,
          versionInfo: changes.generalInformation?.versionInfo,
          issued: changes.generalInformation?.issued,
          accrualPeriodicity: changes.generalInformation?.accrualPeriodicity,
          type: changes.generalInformation?.type,
          qualityAssurance: changes.generalInformation?.qualityAssurance,
        };

        this.entityExecutionService.setActiveDataProduct(updatingObject);
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
        metaId: this.dataProduct?.metaId,
        type: Entity.DATA_PRODUCT,
        instanceId: this.dataProduct?.instanceId,
      },
      '65vw',
      'auto',
      'revisions-dialog',
    );
  }

  public handleDelete(): void {
    if (this.dataProduct?.instanceId) {
      const toDelete = new Map<string, EntityEndpointValue>();
      toDelete.set(this.dataProduct?.instanceId as string, EntityEndpointValue.DATA_PRODUCT);
      this.dialogService.handleDelete(toDelete);
    }
  }

  public handleScrollToTop(): void {
    scrollBackToTop(this.scrollable);
  }
}
