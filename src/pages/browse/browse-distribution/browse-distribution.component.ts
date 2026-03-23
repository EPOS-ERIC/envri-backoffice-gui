import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { DataProduct, Group } from 'generated/backofficeSchemas';
import { ApiService } from 'src/apiAndObjects/api/api.service';
import { DialogNewEntityComponent } from 'src/components/dialogs/dialog-new-entity/dialog-new-entity.component';
import { DialogService } from 'src/components/dialogs/dialog.service';
import { ActionsService } from 'src/services/actions.service';
import { ActiveUserService } from 'src/services/activeUser.service';
import { EntityService } from 'src/services/entity.service';
import { SnackbarService, SnackbarType } from 'src/services/snackbar.service';
import { Entity } from 'src/utility/enums/entity.enum';
import { EntityEndpointValue } from 'src/utility/enums/entityEndpointValue.enum';

@Component({
  selector: 'app-browse-distribution',
  templateUrl: './browse-distribution.component.html',
  styleUrls: ['./browse-distribution.component.scss'],
})
export class BrowseDistributionComponent {
  public sectionName = Entity.DISTRIBUTION;

  constructor(
    private router: Router,
    private entityService: EntityService,
    private dialogService: DialogService,
    private apiService: ApiService,
    private snackbarService: SnackbarService,
    private actionsService: ActionsService,
    private activeUserService: ActiveUserService,
  ) {}

  private handleCreate(group: Group): void {
    const item: DataProduct = {
      created: '2024-07-11T09:35:25.018Z',
      groups: [group.id as string],
    };

    this.apiService.endpoints.DataProduct.create
      .call(item)
      .then((value: DataProduct) => {
        this.router.navigate([`/browse/${EntityEndpointValue.DATA_PRODUCT}/details`, value.metaId, value.instanceId]);
        this.snackbarService.openSnackbar(`Success: ${value.uid} created`, 'close', SnackbarType.SUCCESS, 6000, [
          'snackbar',
          'mat-toolbar',
          'snackbar-success',
        ]);
        this.actionsService.saveCurrentEdit(value.instanceId as string);
        this.apiService.endpoints.Group.addEntityToGroup
          .call({ groupid: group.id!, metaId: value.metaId! })
          .then(() => {
            this.snackbarService.openSnackbar(`Added entity to ${group.name}`, 'close', SnackbarType.SUCCESS, 6000, [
              'snackbar',
              'mat-toolbar',
              'snackbar-success',
            ]);
          });
      })
      .catch(() =>
        this.snackbarService.openSnackbar(
          `Error: failed to create new Data Product`,
          'close',
          SnackbarType.ERROR,
          6000,
          ['snackbar', 'mat-toolbar', 'snackbar-error'],
        ),
      );
  }

  public rowClicked(row: Record<string, unknown>): void {
    const dataProduct = row['dataProduct'] as DataProduct;
    if (dataProduct) {
      this.entityService.setFocusedDistribution(row['instanceId'] as string);
      this.router.navigate([
        `/browse/${EntityEndpointValue.DATA_PRODUCT}/details`,
        dataProduct['metaId'],
        dataProduct['instanceId'],
      ]);
    }
  }

  public createAsset(): void {
    if (this.activeUserService.getActiveUser()?.groups?.length === 0) {
      this.dialogService
        .openConfirmationDialog(
          'You are not a member of a Group, to create a product you must be a Group member. Proceed to Groups page?',
        )
        .then((accepted: boolean) => {
          if (accepted) {
            this.router.navigate(['groups']);
          }
        });
    } else {
      this.dialogService
        .openDialogForComponent(DialogNewEntityComponent, { entityType: Entity.DATA_PRODUCT }, 'new-dataproduct-dialog')
        .then((response) => {
          if (response.dataOut.create) {
            this.handleCreate(response.dataOut.group);
          }
        });
    }
  }
}
