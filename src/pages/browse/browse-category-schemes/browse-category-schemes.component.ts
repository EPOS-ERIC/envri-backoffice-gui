import { Component, OnInit, ViewChild } from '@angular/core';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { NgScrollbar } from 'ngx-scrollbar';
import { scrollBackToTop } from 'src/helpers/scroll';
import { ApiService } from 'src/apiAndObjects/api/api.service';
import { CategoryScheme } from 'generated/backofficeSchemas';
import { LoadingService } from 'src/services/loading.service';
import { SnackbarService, SnackbarType } from 'src/services/snackbar.service';
import { DialogService } from 'src/components/dialogs/dialog.service';

import { Status } from 'src/utility/enums/status.enum';
import { DialogNewCategorySchemeComponent } from '../../../components/dialogs/dialog-new-category-scheme/dialog-new-category-scheme.component';

@Component({
  selector: 'app-browse-category-schemes',
  templateUrl: './browse-category-schemes.component.html',
  styleUrl: './browse-category-schemes.component.scss',
})
export class BrowseCategorySchemesComponent implements OnInit {
  @ViewChild(NgScrollbar) scrollable!: NgScrollbar;

  public categorySchemes: Array<CategoryScheme> = [];
  public isSavingOrder = false;
  public statusEnum = Status;

  constructor(
    private readonly apiService: ApiService,
    private readonly loadingService: LoadingService,
    private readonly snackbarService: SnackbarService,
    private readonly dialogService: DialogService,
  ) {}

  public ngOnInit(): void {
    this.refreshList();
  }

  public refreshList(): Promise<void> {
    this.loadingService.setShowSpinner(true);
    return this.apiService.endpoints.CategoryScheme.getAll
      .call()
      .then((schemes) => {
        this.categorySchemes = schemes.filter(
          (scheme) => scheme.status !== Status.ARCHIVED && scheme.status !== Status.DISCARDED,
        ).sort((firstScheme, secondScheme) => this.sortByOrderItemNumber(firstScheme, secondScheme));  
      })
      .finally(() => this.loadingService.setShowSpinner(false));
  }

  private sortByOrderItemNumber(firstScheme: CategoryScheme, secondScheme: CategoryScheme): number {
    const firstOrder = this.parseOrderItemNumber(firstScheme.orderitemnumber);
    const secondOrder = this.parseOrderItemNumber(secondScheme.orderitemnumber);

    if (firstOrder === null && secondOrder === null) return 0;
    if (firstOrder === null) return 1;
    if (secondOrder === null) return -1;

    return firstOrder - secondOrder;
  }

  private parseOrderItemNumber(orderitemnumber: string | undefined): number | null {
    const parsedOrder = Number.parseInt(orderitemnumber || '', 10);

    return Number.isNaN(parsedOrder) ? null : parsedOrder;
  }

  /**
   * Converts relative asset paths to absolute URLs
   */
  public getLogoUrl(logo: string | undefined): string | null {
    if (!logo) return null;
    
    // If it's already a full URL, return it
    if (logo.startsWith('http://') || logo.startsWith('https://')) {
      return logo;
    }
    
    // If it's a relative path starting with 'assets/', convert it
    if (logo.startsWith('assets/')) {
        return logo;
    }
    
    return logo;
  }

  /**
   * Handle image load errors
   */
  public handleImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    console.error('Failed to load image:', img.src);
    img.style.display = 'none';
  }

  public handleDrop(event: CdkDragDrop<CategoryScheme[]>): void {
    if (event.previousIndex === event.currentIndex || this.isSavingOrder) return;

    const previousOrderNumbers = new Map(
      this.categorySchemes.map((scheme) => [scheme.uid, scheme.orderitemnumber]),
    );

    moveItemInArray(this.categorySchemes, event.previousIndex, event.currentIndex);
    this.categorySchemes = this.normalizeSchemeOrder(this.categorySchemes);

    const changedSchemes = this.categorySchemes.filter(
      (scheme) => previousOrderNumbers.get(scheme.uid) !== scheme.orderitemnumber,
    );

    if (changedSchemes.length === 0) return;

    this.persistSchemeUpdates(
      changedSchemes,
      undefined,
      'Error updating category scheme order.',
    );
  }

  private normalizeSchemeOrder(schemes: CategoryScheme[]): Array<CategoryScheme> {
    return schemes.map((scheme, index) => ({
      ...scheme,
      orderitemnumber: (index + 1).toString(),
    }));
  }

  private persistSchemeUpdates(
    schemes: Array<CategoryScheme>,
    successMessage?: string,
    errorMessage?: string,
  ): void {
    this.isSavingOrder = true;
    this.loadingService.setShowSpinner(true);

    Promise.all(schemes.map((scheme) => this.apiService.endpoints.CategoryScheme.update.call(scheme)))
      .then(() => this.refreshList())
      .then(() => {
        if (successMessage) {
          this.snackbarService.openSnackbar(
            successMessage,
            'close',
            SnackbarType.SUCCESS,
            6000,
            ['snackbar', 'mat-toolbar', 'snackbar-success'],
          );
        }
      })
      .catch((error) => {
        console.error(errorMessage || 'Error updating category scheme:', error);
        this.snackbarService.openSnackbar(
          errorMessage || 'Error updating category scheme.',
          'close',
          SnackbarType.ERROR,
        );
        this.refreshList();
      })
      .finally(() => {
        this.isSavingOrder = false;
        this.loadingService.setShowSpinner(false);
      });
  }

  public handleAddScheme(): void {
    this.dialogService.openDialogForComponent(DialogNewCategorySchemeComponent).then((response) => {
      // Check if dataOut exists and has data
      if (response && response.dataOut && Object.keys(response.dataOut).length > 0) {
        this.loadingService.setShowSpinner(true);

        const schemePayload: CategoryScheme = {
          title: response.dataOut.title,
          description: response.dataOut.description,
          code: response.dataOut.code,
          color: response.dataOut.color,
          homepage: response.dataOut.homepage,
          logo: response.dataOut.logo,
          orderitemnumber: response.dataOut.orderitemnumber,
          topConcepts: response.dataOut.topConcepts,
          uid: response.dataOut.uid,
        };

        this.apiService.endpoints.CategoryScheme.create
          .call(schemePayload)
          .then(() => {
            this.snackbarService.openSnackbar(
              `Category scheme "${response.dataOut.title}" created successfully.`,
              'close',
              SnackbarType.SUCCESS,
              6000,
              ['snackbar', 'mat-toolbar', 'snackbar-success'],
            );
            this.refreshList();
          })
          .catch((error) => {
            console.error('Error creating category scheme:', error);
            this.snackbarService.openSnackbar(
              `Error creating category scheme "${response.dataOut.title}".`,
              'close',
              SnackbarType.ERROR,
            );
          })
          .finally(() => this.loadingService.setShowSpinner(false));
      }
    });
  }

  public handleEditScheme(scheme: CategoryScheme): void {
    this.dialogService.openDialogForComponent(DialogNewCategorySchemeComponent, scheme).then((response) => {
      if (response && response.dataOut && Object.keys(response.dataOut).length > 0) {
        const schemePayload: CategoryScheme = {
          title: response.dataOut.title,
          description: response.dataOut.description,
          code: response.dataOut.code,
          color: response.dataOut.color,
          homepage: response.dataOut.homepage,
          logo: response.dataOut.logo,
          orderitemnumber: response.dataOut.orderitemnumber,
          topConcepts: response.dataOut.topConcepts,
          uid: response.dataOut.uid,
          instanceId: response.dataOut.instanceId,
          status: response.dataOut.status,
        };

        const targetOrder = this.parseOrderItemNumber(response.dataOut.orderitemnumber) ?? 1;
        const currentIndex = this.categorySchemes.findIndex((existingScheme) => existingScheme.uid === schemePayload.uid);

        if (currentIndex === -1) return;

        const reorderedSchemes = [...this.categorySchemes];
        reorderedSchemes.splice(currentIndex, 1);

        const boundedIndex = Math.min(
          Math.max(targetOrder - 1, 0),
          reorderedSchemes.length,
        );

        reorderedSchemes.splice(boundedIndex, 0, schemePayload);

        const normalizedSchemes = this.normalizeSchemeOrder(reorderedSchemes);
        const previousSchemes = new Map(
          this.categorySchemes.map((existingScheme) => [existingScheme.uid, existingScheme]),
        );

        const changedSchemes = normalizedSchemes.filter((normalizedScheme) => {
          const previousScheme = previousSchemes.get(normalizedScheme.uid);

          if (!previousScheme) return true;

          return previousScheme.orderitemnumber !== normalizedScheme.orderitemnumber
            || previousScheme.title !== normalizedScheme.title
            || previousScheme.description !== normalizedScheme.description
            || previousScheme.code !== normalizedScheme.code
            || previousScheme.color !== normalizedScheme.color
            || previousScheme.homepage !== normalizedScheme.homepage
            || previousScheme.logo !== normalizedScheme.logo
            || previousScheme.status !== normalizedScheme.status
            || JSON.stringify(previousScheme.topConcepts || []) !== JSON.stringify(normalizedScheme.topConcepts || []);
        });

        if (changedSchemes.length === 0) return;

        this.categorySchemes = normalizedSchemes;
        this.persistSchemeUpdates(
          changedSchemes,
          `Category scheme "${response.dataOut.title}" updated successfully.`,
          `Error updating category scheme "${response.dataOut.title}".`,
        );
      }
    });
  }

  public handleScrollToTop(): void {
    scrollBackToTop(this.scrollable);
  }
}
