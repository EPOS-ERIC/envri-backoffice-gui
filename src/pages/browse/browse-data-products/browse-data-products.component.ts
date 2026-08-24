import { Component, ViewChild } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { Router } from '@angular/router';
import { NgScrollbar } from 'ngx-scrollbar';
import { DialogNewEntityComponent } from 'src/components/dialogs/dialog-new-entity/dialog-new-entity.component';
import { DialogService } from 'src/components/dialogs/dialog.service';
import { scrollBackToTop } from 'src/helpers/scroll';
import { ActionsService } from 'src/services/actions.service';
import { SnackbarService, SnackbarType } from 'src/services/snackbar.service';
import { Entity } from 'src/utility/enums/entity.enum';
import { EntityEndpointValue } from 'src/utility/enums/entityEndpointValue.enum';
import { DataProduct, Group } from 'generated/backofficeSchemas';
import { ApiService } from 'src/apiAndObjects/api/api.service';
import { ActiveUserService } from 'src/services/activeUser.service';

@Component({
  selector: 'app-browse-data-products',
  templateUrl: './browse-data-products.component.html',
  styleUrls: ['./browse-data-products.component.scss'],
})
export class BrowseDataProductsComponent {
  @ViewChild(NgScrollbar) scrollable!: NgScrollbar;

  public sectionName = Entity.DATA_PRODUCT;
  public showButton = false;

  constructor(
    private readonly router: Router,
    private readonly dialogService: DialogService,
    private readonly actionsService: ActionsService,
    private readonly snackbarService: SnackbarService,
    private readonly apiService: ApiService,
    private readonly activeUserService: ActiveUserService,
  ) {}

  public rowClicked(row: Record<string, string>): void {
    this.router.navigate([`/browse/dataproduct/details`, row['metaId'], row['instanceId']]);
  }

  public handleScrollToTop(): void {
    scrollBackToTop(this.scrollable);
  }

  public handlePaginationChange(event: PageEvent): void {
    if (event.pageSize >= 25) {
      this.showButton = true;
    } else {
      this.showButton = false;
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

  private handleCreate(group: Group): void {
    const item: DataProduct = {
      created: '',
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
      })
      .catch((err) => {
        console.error(err);
        this.snackbarService.openSnackbar(
          `Error: failed to create new Data Product`,
          'close',
          SnackbarType.ERROR,
          6000,
          ['snackbar', 'mat-toolbar', 'snackbar-error'],
        );
      });
  }
}
