import { Component, OnDestroy, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { ActivatedRoute, NavigationBehaviorOptions, Router } from '@angular/router';
import { ApiService } from 'src/apiAndObjects/api/api.service';
import { DialogService } from 'src/components/dialogs/dialog.service';
import { ActionsService } from 'src/services/actions.service';
import { HelpersService } from 'src/services/helpers.service';
import { PersistorService, StorageType } from 'src/services/persistor.service';
import { SnackbarService, SnackbarType } from 'src/services/snackbar.service';
import { Entity } from 'src/utility/enums/entity.enum';
import { EntityEndpointValue } from 'src/utility/enums/entityEndpointValue.enum';
import { StorageKey } from 'src/utility/enums/storageKey.enum';
import { IChangeItem } from 'src/components/side-navigation/edit-navigation/edit.interface';
import { Location } from '@angular/common';
import { WebService } from 'generated/backofficeSchemas';

@Component({
  selector: 'app-browse-web-services-item',
  templateUrl: './browse-web-services-item.component.html',
  styleUrls: ['./browse-web-services-item.component.scss'],
})
export class BrowseWebServicesItemComponent implements OnInit, OnDestroy {
  public options: UntypedFormGroup;
  private hideRequiredControl = new UntypedFormControl(false);
  public floatLabelControl = new UntypedFormControl('auto');
  public webservice!: WebService | undefined;
  public editModeEnabled = false;
  public form!: UntypedFormGroup;
  public entityRoute = EntityEndpointValue.WEBSERVICE;
  public currentEdit!: IChangeItem;
  public state!: NavigationBehaviorOptions['state'] | undefined;

  constructor(
    private fb: UntypedFormBuilder,
    private router: Router,
    private dialogService: DialogService,
    private snackbarService: SnackbarService,
    private formBuilder: UntypedFormBuilder,
    private route: ActivatedRoute,
    private apiService: ApiService,
    private actionService: ActionsService,
    private persistorService: PersistorService,
    private location: Location,
  ) {
    this.options = this.fb.group({
      hideRequired: this.hideRequiredControl,
      floatLabel: this.floatLabelControl,
    });
    this.webservice = this.location.getState() as WebService;
    this.state = this.location.getState() as NavigationBehaviorOptions['state'];
  }

  ngOnInit(): void {
    this.persistorService.setValueInStorage(StorageType.LOCAL_STORAGE, StorageKey.ACTIVE_ENTITY, Entity.WEBSERVICE);
    this.route.paramMap.subscribe((obs) => {
      if (null != obs.get('id')) {
        this.initData(obs.get('id') as string);
      }
    });
  }

  ngOnDestroy(): void {
    this.actionService.cancelLiveEdit();
  }

  private initData(id: string): void {
    this.apiService.endpoints[Entity.WEBSERVICE].get
      .call(
        {
          metaId: this.state?.['metaId'],
          instanceId: id,
        },
        false,
      )
      .then((data: Array<WebService>) => {
        if (Array.isArray(data) && data.length > 0) {
          this.webservice = data.shift();
          if (this.webservice?.instanceId) {
            this.actionService.setLiveEdit();
            this.trackFormData();
            // this.actionService.trackCurrentEdit({
            //   type: Entity.WEBSERVICE,
            //   route: EntityEndpointValue.WEBSERVICE,
            //   label: 'Webservice',
            //   state: this.webservice.status ? this.webservice.status : Status.DRAFT,
            //   color: 'draft',
            //   id: this.webservice.instanceId,
            // });
          }
        }
      });
  }

  private trackFormData(): void {
    this.form = this.formBuilder.group({
      instanceId: this.webservice?.instanceId as string,
      uid: this.webservice?.uid,
      name: this.webservice?.name,
      description: this.webservice?.description,
      datePublished: this.webservice?.datePublished,
      dateModified: this.webservice?.dateModified,
      changeComment: this.webservice?.changeComment,
      changeTimestamp: this.webservice?.changeTimestamp,
      identifier: this.webservice?.identifier,
      entryPoint: this.webservice?.entryPoint,
      keywords: HelpersService.whiteSpaceReplace(this.webservice?.keywords),
      supportedOperation: this.webservice?.supportedOperation,
      temporalExtent: this.webservice?.temporalExtent,
      license: this.webservice?.license,
    });
    this.form.valueChanges.subscribe((changes) => {
      const value = changes;
      this.actionService.resetToDraft(this.webservice?.instanceId as string);
      this.persistorService.setValueInStorage(
        StorageType.LOCAL_STORAGE,
        StorageKey.ACTIVE_WEBSERVICE_FORM_DATA,
        JSON.stringify(value),
      );
    });
  }

  public handleChange(event: MatSlideToggleChange): void {
    this.editModeEnabled = event.checked;
  }

  public handleSave() {
    // TODO: add Save method for DB operation
    this.snackbarService.openSnackbar('Item saved successfully', 'Close', SnackbarType.SUCCESS, 4000, [
      'snackbar',
      'mat-toolbar',
      'snackbar-primary',
    ]);
  }

  public handleDelete(): void {
    if (this.webservice?.instanceId) {
      const toDelete = new Map<string, EntityEndpointValue>();
      toDelete.set(this.webservice.instanceId, EntityEndpointValue.WEBSERVICE);
      this.dialogService.handleDelete(toDelete);
    }
  }

  public handleCancel(): void {
    // this.dialogService.handleCancel();
  }

  public handleConfirm(): void {
    // this.dialogService.handleConfirm();
  }

  public formatDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    if (date instanceof Date && !isNaN(date.getTime())) {
      return date.toLocaleString('en-GB', { timeZone: 'UTC' });
    }
    return 'Invalid date';
  };
}
