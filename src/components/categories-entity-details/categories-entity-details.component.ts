import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import {
  Category,
  CategoryScheme,
  DataProduct,
  LinkedEntity,
  SoftwareApplication,
  SoftwareSourceCode,
} from 'generated/backofficeSchemas';
import { DataProduct as DataProductModel } from 'src/apiAndObjects/objects/entities/dataProduct.model';
import { SoftwareApplication as SoftwareApplicationModel } from 'src/apiAndObjects/objects/entities/softwareApplication.model';
import { SoftwareSourceCode as SoftwareSourceCodeModel } from 'src/apiAndObjects/objects/entities/softwareSourceCode.model';
import { map } from 'rxjs';
import { ApiService } from 'src/apiAndObjects/api/api.service';
import { EntityExecutionService } from 'src/services/calls/entity-execution.service';
import { HelpersService } from 'src/services/helpers.service';
import { SnackbarService, SnackbarType } from 'src/services/snackbar.service';
import { Entity } from 'src/utility/enums/entity.enum';
import { Status } from 'src/utility/enums/status.enum';
import { ActiveUserService } from 'src/services/activeUser.service';

@Component({
  selector: 'app-categories-entity-details',
  templateUrl: './categories-entity-details.component.html',
  styleUrl: './categories-entity-details.component.scss',
})
export class CategoriesEntityDetailsComponent implements OnInit {
  private _activeEntity!: DataProduct | SoftwareApplication | SoftwareSourceCode;
  @Input() set activeEntity(value: DataProduct | SoftwareApplication | SoftwareSourceCode) {
    this._activeEntity = value;
    if (this.form) {
      this.updateFormState();
    }
  }
  get activeEntity(): DataProduct | SoftwareApplication | SoftwareSourceCode {
    return this._activeEntity;
  }

  get activeEntityType(): string {
    const entityTypeFromInput = this.resolveEntityTypeFromInput();

    if (entityTypeFromInput) {
      return entityTypeFromInput;
    }

    return this.helpersService.activeEntityType.getValue() ?? '';
  }
  @Input() canManageCategories: boolean = false;

  public form!: FormGroup;

  public selectedCategories: Array<Category> = [];

  public selectedCategoryScheme: CategoryScheme | undefined;

  public categorySchemes: Array<CategoryScheme> = [];

  public stateEnum = Status;

  public categories: Array<Category> = [];

  public unfilteredCategories: Array<Category> = [];

  public loading = false;

  public disabled = false;

  public disableSchemeSelect = false;

  private resolveEntityTypeFromInput(): Entity | null {
    if (!this.activeEntity) {
      return null;
    }

    if (
      this.activeEntity instanceof DataProductModel ||
      'distribution' in this.activeEntity ||
      'accrualPeriodicity' in this.activeEntity
    ) {
      return Entity.DATA_PRODUCT;
    }

    if (
      this.activeEntity instanceof SoftwareApplicationModel ||
      'operatingSystem' in this.activeEntity ||
      'requirements' in this.activeEntity
    ) {
      return Entity.SOFTWARE_APPLICATION;
    }

    if (
      this.activeEntity instanceof SoftwareSourceCodeModel ||
      'programmingLanguage' in this.activeEntity ||
      'softwareRequirements' in this.activeEntity
    ) {
      return Entity.SOFTWARE_SOURCE_CODE;
    }

    return null;
  }

  constructor(
    private readonly apiService: ApiService,
    private readonly formBuilder: FormBuilder,
    private readonly entityExecutionService: EntityExecutionService,
    private readonly snackbarService: SnackbarService,
    private readonly helpersService: HelpersService,
    private readonly activeUserService: ActiveUserService,
  ) {}
  public ngOnInit(): void {
    this.initData();
    this.initForm();
  }

  private initData(): void {
    // Get all category schemes.
    this.apiService.endpoints.CategoryScheme.getAll.call().then((response: CategoryScheme[]) => {
      this.categorySchemes = response;
    });

    if (this.categories.length === 0) {
      this.loading = true;
      this.apiService.endpoints.Category.getAll
        .call()
        .then((response: Category[]) => {
          this.selectedCategories = response.filter((category: Category) => {
            return this.activeEntity?.category?.some((value: LinkedEntity) => {
              return category.uid === value.uid;
            });
          });
          this.selectedCategories.length > 0 ? (this.disableSchemeSelect = true) : (this.disableSchemeSelect = false);

          this.unfilteredCategories = response;
          if (this.selectedCategories.length > 0) {
            // If there is a selected category, filter the categories based on the selectedCategories CATEGORY_SCHEME.
            this.categories = response.filter(
              (category: Category) => category.inScheme?.metaId === this.selectedCategories[0].inScheme?.metaId,
            );
            this.selectedCategoryScheme = this.categorySchemes.find(
              (categoryScheme: CategoryScheme) => categoryScheme.uid === this.selectedCategories[0].inScheme?.uid,
            );
            this.loading = false;
            // if there no selected categories, let user choose category scheme and subsequent category
          } else {
            this.updateCategories(this.unfilteredCategories);
          }

          this.form.controls['category'].setValue(this.selectedCategories);
        })
        .catch(() => (this.loading = false));
    }
  }

  private initForm(): void {
    this.form = this.formBuilder.group({
      category: new FormControl(),
      categoryScheme: new FormControl(),
    });
    this.updateFormState();
    this.trackFormChanges();
  }

  private updateFormState(): void {
    if ((this.activeEntity?.status === Status.SUBMITTED && !this.userHasEditPermissionsForSubmitted()) || this.activeEntity?.status === Status.PUBLISHED || this.activeEntity?.status === Status.ARCHIVED) {
      this.form.disable();
      this.disabled = true;
    } else {
      this.form.enable();
      this.disabled = false;
    }
  }

  private trackFormChanges(): void {
    this.form.valueChanges
      .pipe(
        map((changes) => {
          const category = changes['category'];
          if (null != category) {
            return category.map((category: Category) => ({
              uid: category.uid,
              metaId: category.metaId,
              instanceId: category.instanceId,
              entityType: Entity.CATEGORY,
            }));
          }
        }),
      )
      .subscribe((categories: Category[]) => {
        if (null != categories) {
          let currentEntity: DataProduct | SoftwareApplication | SoftwareSourceCode | undefined;
          if (this.activeEntity instanceof DataProductModel) {
            currentEntity = this.entityExecutionService.getActiveDataProductValue() as DataProduct;
          } else if (this.activeEntity instanceof SoftwareApplicationModel) {
            currentEntity = this.entityExecutionService.getActiveSoftwareApplicationValue() as SoftwareApplication;
          } else if (this.activeEntity instanceof SoftwareSourceCodeModel) {
            currentEntity = this.entityExecutionService.getActiveSoftwareSourceCodeValue() as SoftwareSourceCode;
          } else {
            currentEntity = undefined;
          }

          if (currentEntity) {
            // Get existing categories from the data product
            const existingCategories = currentEntity.category || [];

            // Get UIDs of categories from the current scheme (categories visible in current tree)
            const currentSchemeUids = new Set(this.categories.map((cat: Category) => cat.uid));

            // Filter out existing categories that belong to the current scheme
            const categoriesFromOtherSchemes = existingCategories.filter(
              (cat: LinkedEntity) => !currentSchemeUids.has(cat.uid),
            );

            // Merge: Keep categories from other schemes + new selections from current scheme
            const mergedCategories = [...categoriesFromOtherSchemes, ...categories];

            // Update the data product with merged categories
            currentEntity.category = mergedCategories;

            // Also update local reference
            if (this.activeEntity) {
              this.activeEntity.category = mergedCategories;
            }
          }
        }
      });
  }

  public userHasEditPermissionsForSubmitted(): boolean{
    // check for User Role - if user not an ADMIN or REVIEWER can see the SUBMITTED, but can't edit them
    const activeUser = this.activeUserService.getActiveUser();
    if(activeUser){
      const activeUserGroups = activeUser.groups;
      if(activeUserGroups){
        // find group in UserGroups matching with current active loaded Entity
        const groupMatch = activeUserGroups.find(group => group.groupId === this.activeEntity?.groups?.find(entityGroup => entityGroup === group.groupId));
        if(groupMatch){
          const userRole = groupMatch.role;
          if(userRole && (userRole === 'ADMIN' || userRole === 'REVIEWER')){
            return true;
          }
          else{
            return false;
          }
        }
        else{
          return false;
        }
      }
      else{
        return false;
      }
    }
    else{
      return false;
    }
  }

  public updateCategories(categories: Array<Category>): void {
    this.categories = categories.filter(
      (category: Category) => category.inScheme?.uid === this.selectedCategoryScheme?.uid,
    );
    this.loading = false;
  }

  public notifyChange(): void {
    this.selectedCategories.length > 0 ? (this.disableSchemeSelect = true) : (this.disableSchemeSelect = false);
    this.snackbarService.openSnackbar(`Please save.`, 'close', SnackbarType.WARNING, 3000, [
      'snackbar',
      'mat-toolbar',
      'snackbar-warning',
    ]);
  }

  public updateSelectedCategoriesInEntity(selectedCategories: Array<Category>): void {
    let currentEntity: DataProduct | SoftwareApplication | SoftwareSourceCode | null;
    switch (this.activeEntityType) {
      case Entity.DATA_PRODUCT:
        currentEntity = this.entityExecutionService.getActiveDataProductValue();
        break;
      case Entity.SOFTWARE_APPLICATION:
        currentEntity = this.entityExecutionService.getActiveSoftwareApplicationValue();
        break;
      case Entity.SOFTWARE_SOURCE_CODE:
        currentEntity = this.entityExecutionService.getActiveSoftwareSourceCodeValue();
        break;
      default:
        currentEntity = null;
    }

    if (!currentEntity) {
      return;
    }

    // Normalize the new selections to LinkedEntity format
    const normalizedNewCategories: Array<LinkedEntity> = selectedCategories.map((selCat: Category) => ({
      uid: selCat.uid,
      metaId: selCat.metaId,
      instanceId: selCat.instanceId,
      entityType: Entity.CATEGORY,
    }));

    // Get existing categories from the data product
    const existingCategories = currentEntity.category || [];

    // Get UIDs of categories from the current scheme (categories visible in current tree)
    const currentSchemeUids = new Set(this.categories.map((cat: Category) => cat.uid));

    // Filter out existing categories that belong to the current scheme
    // (these will be replaced by the new selection from this scheme)
    const categoriesFromOtherSchemes = existingCategories.filter(
      (cat: LinkedEntity) => !currentSchemeUids.has(cat.uid),
    );

    // Merge: Keep categories from other schemes + new selections from current scheme
    const mergedCategories = [...categoriesFromOtherSchemes, ...normalizedNewCategories];

    // Update the data product with merged categories
    currentEntity.category = mergedCategories;

    // Also update the local dataProduct reference
    if (this.activeEntity) {
      this.activeEntity.category = mergedCategories;
    }

    this.notifyChange();
  }
}
