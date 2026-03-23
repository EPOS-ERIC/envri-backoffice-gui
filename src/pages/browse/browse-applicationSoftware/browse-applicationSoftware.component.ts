import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { DataProduct, Group, SoftwareApplication } from 'generated/backofficeSchemas';
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
  selector: 'app-browse-applicationsoftware',
  templateUrl: './browse-applicationSoftware.component.html',
  styleUrls: ['./browse-applicationSoftware.component.scss'],
})
export class BrowseApplicationSoftwareComponent {
  public sectionName = Entity.SOFTWARE_APPLICATION;

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
    const item: SoftwareApplication = {
      // TODO: define Software Application type
      /* created: '2024-07-11T09:35:25.018Z', */
      groups: [group.id as string],
    };

    this.apiService.endpoints.SoftwareApplication.create
      .call(item)
      .then((value: SoftwareApplication) => {
        this.router.navigate([
          `/browse/${EntityEndpointValue.APPLICATION_SOFTWARE}/details`,
          value.metaId,
          value.instanceId,
        ]);
        this.snackbarService.openSnackbar(`Success: ${value.uid} created`, 'close', SnackbarType.SUCCESS, 6000, [
          'snackbar',
          'mat-toolbar',
          'snackbar-success',
        ]);
        this.actionsService.saveCurrentEdit(value.instanceId as string);
      })
      .catch(() =>
        this.snackbarService.openSnackbar(
          `Error: failed to create new Software Application`,
          'close',
          SnackbarType.ERROR,
          6000,
          ['snackbar', 'mat-toolbar', 'snackbar-error'],
        ),
      );
  }

  public rowClicked(row: Record<string, unknown>): void {
    const dataProduct = row['dataProduct'] as DataProduct; // TODO: change to SoftwareApplication? (NO dataProduct field in SoftwareApplication)

    if (dataProduct === undefined) {
      this.entityService.setFocusedDistribution(row['instanceId'] as string); // TODO: change to SoftwareApplication? (NO distribution field in SoftwareApplication)
      this.router.navigate([
        `/browse/${EntityEndpointValue.APPLICATION_SOFTWARE}/details`,
        row['metaId'],
        row['instanceId'],
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
        .openDialogForComponent(
          DialogNewEntityComponent,
          { entityType: Entity.SOFTWARE_APPLICATION },
          'new-dataproduct-dialog',
        ) // TODO: create/adjust for dialog of Software Source Code!
        .then((response) => {
          if (response.dataOut.create) {
            this.handleCreate(response.dataOut.group);
          }
        });
    }
  }
}
