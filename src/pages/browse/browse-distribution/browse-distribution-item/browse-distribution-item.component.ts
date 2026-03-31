import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormArray, UntypedFormBuilder, UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from 'src/apiAndObjects/api/api.service';
import { DialogService } from 'src/components/dialogs/dialog.service';
import { DialogRevisionsComponent } from 'src/components/dialogs/dialog-revisions/dialog-revisions.component';
import { IChangeItem } from 'src/components/side-navigation/edit-navigation/edit.interface';
import { ActionsService } from 'src/services/actions.service';
import { PersistorService, StorageType } from 'src/services/persistor.service';
import { Entity } from 'src/utility/enums/entity.enum';
import { EntityEndpointValue } from 'src/utility/enums/entityEndpointValue.enum';
import { StorageKey } from 'src/utility/enums/storageKey.enum';
import { ContactPoint, Distribution } from 'generated/backofficeSchemas';
import { Status } from 'src/utility/enums/status.enum';

@Component({
  selector: 'app-browse-distribution-item',
  templateUrl: './browse-distribution-item.component.html',
  styleUrls: ['./browse-distribution-item.component.scss'],
})
export class BrowseDistributionItemComponent implements OnInit, OnDestroy {
  public floatLabelControl = new UntypedFormControl('auto');
  public distributionDetail!: Distribution | undefined;
  public UID!: string | null;
  public currentEdit!: IChangeItem;
  public form!: UntypedFormGroup;
  public distributionLoaded = false;
  public contactPoint!: Array<ContactPoint>;
  public contactPointLoaded = false;
  public entityRoute = EntityEndpointValue.DISTRIBUTION;

  constructor(
    private dialogService: DialogService,
    private actionService: ActionsService,
    private formBuilder: UntypedFormBuilder,
    private route: ActivatedRoute,
    private apiService: ApiService,
    private persistorService: PersistorService,
  ) {
    this.UID = this.route.snapshot.paramMap.get('id');
  }

  public ngOnInit(): void {
    this.persistorService.setValueInStorage(StorageType.LOCAL_STORAGE, StorageKey.ACTIVE_ENTITY, Entity.DISTRIBUTION);
    this.route.paramMap.subscribe((obs) => {
      if (null != obs.get('id') && null != obs.get('metaId')) {
        this.initData(obs.get('id') as string, obs.get('metaId') as string);
      }
    });
  }

  public ngOnDestroy(): void {
    this.actionService.cancelLiveEdit();
  }

  private initData(id: string, metaId: string): void {
    this.apiService.endpoints.Distribution.get
      .call(
        {
          metaId: metaId,
          instanceId: id,
        },
        false,
      )
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          this.distributionDetail = data.shift();
          if (this.distributionDetail) {
            this.actionService.setLiveEdit();
            this.trackFormData();
            this.actionService.trackCurrentEdit({
              type: Entity.DISTRIBUTION,
              route: EntityEndpointValue.DISTRIBUTION,
              label: 'Distribution',
              status: this.distributionDetail.status as Status,
              color: 'draft',
              id: this.distributionDetail.instanceId as string,
            });
          }
        }
      });
  }

  private trackFormData(): void {
    this.form = this.formBuilder.group({
      instanceId: this.distributionDetail?.instanceId as string,
      uid: this.distributionDetail?.uid,
      title: [this.distributionDetail?.title],
      description: [this.distributionDetail?.description],
      changeTimestamp: this.distributionDetail?.changeTimestamp,
      state: this.distributionDetail?.status,
      modified: this.distributionDetail?.modified,
    });
    this.form.valueChanges.subscribe((changes) => {
      const value = changes;
      // value['description'] = [changes['description']];
      // value['title'] = [changes['title']];
      this.actionService.resetToDraft(this.distributionDetail?.instanceId as string);
      this.persistorService.setValueInStorage(
        StorageType.LOCAL_STORAGE,
        StorageKey.ACTIVE_DISTRIBUTION_FORM_DATA,
        JSON.stringify(value),
      );
    });
  }

  public getControls(field: string) {
    return (this.form.get(field) as FormArray).controls;
  }

  public handleGetRevisions(): void {
    // Todo: pass revisions data to component
    this.dialogService.openDialogForComponent(DialogRevisionsComponent, {}, 'revisions-dialog');
  }

  public handleDelete(): void {
    // Todo: delete item from DB
    if (this.distributionDetail?.instanceId) {
      const toDelete = new Map<string, EntityEndpointValue>();
      toDelete.set(this.distributionDetail.instanceId, EntityEndpointValue.DISTRIBUTION);
      this.dialogService.handleDelete(toDelete);
    }
  }
}
