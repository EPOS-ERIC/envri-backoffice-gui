import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Group, SoftwareSourceCode } from 'generated/backofficeSchemas';
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
  selector: 'app-browse-softwareSourceCode',
  templateUrl: './browse-softwareSourceCode.component.html',
  styleUrls: ['./browse-softwareSourceCode.component.scss'],
})
export class BrowseSoftwareSourceCodeComponent {
  public sectionName = Entity.SOFTWARE_SOURCE_CODE;

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
    const item: SoftwareSourceCode = {
      /* created: '2024-07-11T09:35:25.018Z', */
      groups: [group.id as string],
    };

    this.apiService.endpoints.SoftwareSourceCode.create
      .call(item)
      .then((value: SoftwareSourceCode) => {
        this.router.navigate([
          `/browse/${EntityEndpointValue.SOFTWARE_SOURCE_CODE}/details`,
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
          `Error: failed to create new Software Source Code`,
          'close',
          SnackbarType.ERROR,
          6000,
          ['snackbar', 'mat-toolbar', 'snackbar-error'],
        ),
      );
  }

  public rowClicked(row: Record<string, unknown>): void {
    const dataProduct = row['dataProduct'] as SoftwareSourceCode; // TODO: change to softwareSourceCode ? CHECK (NO dataProduct field in SoftwareSourceCode)
    if (dataProduct === undefined) {
      this.entityService.setFocusedDistribution(row['instanceId'] as string); // TODO: change to softwareSourceCode ? CHECK (NO distribution field in SoftwareSourceCode)
      this.router.navigate([
        `/browse/${EntityEndpointValue.SOFTWARE_SOURCE_CODE}/details`,
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
          { entityType: Entity.SOFTWARE_SOURCE_CODE },
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
