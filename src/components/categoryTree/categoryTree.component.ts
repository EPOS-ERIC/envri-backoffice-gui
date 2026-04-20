import { NestedTreeControl } from '@angular/cdk/tree';
import { ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { MatTreeNestedDataSource } from '@angular/material/tree';
import { Category, CategoryScheme, DataProduct, SoftwareApplication, SoftwareSourceCode } from 'generated/backofficeSchemas';
import { ApiService } from 'src/apiAndObjects/api/api.service';
import { SnackbarService, SnackbarType } from 'src/services/snackbar.service';
import { DialogService } from 'src/components/dialogs/dialog.service';
import { DialogNewCategoryComponent } from 'src/components/dialogs/dialog-new-category/dialog-new-category.component';
import { EntityEndpointValue } from 'src/utility/enums/entityEndpointValue.enum';
import { Status } from 'src/utility/enums/status.enum';

// interface fo hierarchical representation of categories
export interface CategoryNode extends Category {
  children?: CategoryNode[];
}

import { ActiveUserService } from 'src/services/activeUser.service';
import { HelpersService } from 'src/services/helpers.service';
import { Entity } from 'src/utility/enums/entity.enum';
import { EntityExecutionService } from 'src/services/calls/entity-execution.service';

@Component({
  selector: 'app-category-tree-details',
  templateUrl: './categoryTree.component.html',
  styleUrl: './categoryTree.component.scss',
})
export class CategoryTreeDetailsComponent implements OnInit {
  @Input() set categories(categories: Array<Category>) {
    if (categories && categories.length > 0) {
      this._categories = categories;
      this.treeData = this.buildCategoryTree(categories);
      this.dataSource.data = this.treeData;
      this.treeControl.dataNodes = this.treeData;
    } else {
      // Clear the tree if categories is empty or null
      this._categories = [];
      this.treeData = [];
      this.dataSource.data = [];
      this.treeControl.dataNodes = [];
    }
  }

  // the selected categories received directly from Data Product response
  @Input() set entitySelectedCategories(dpSelectedCategories: Array<Category>) {
    dpSelectedCategories.forEach((cat) => {
      if (cat.name && cat.name !== '') {
        this.selectedCategories.push(cat.name);
      }
      // Also populate the object array so it's included when emitting updates
      if (!this.selectedCategoriesObjArr.some((existing) => existing.uid === cat.uid)) {
        this.selectedCategoriesObjArr.push(cat);
      }
    });
  }

  // the selected category scheme from parent component
  @Input() selectedCategoryScheme: CategoryScheme | undefined;
  @Input() canManageCategories: boolean = false;

  @Input() activeEntity: DataProduct | SoftwareApplication | SoftwareSourceCode | undefined;
  @Input() entityStatus: string | undefined;

  @Output() updateSelectedCategories = new EventEmitter();
  @Output() categoryChanged = new EventEmitter<void>();

  public _categories: Array<Category> = [];
  // holding the categories names bare strings
  public selectedCategories: Array<string> = [];
  public selectedCategoriesObjArr: Array<Category> = [];

  public _entitySelectedCategories: Array<string> = [];

  public treeControl = new NestedTreeControl<CategoryNode>((node) => node.children);
  public dataSource = new MatTreeNestedDataSource<CategoryNode>();
  public treeData: CategoryNode[] = [];

  public inCategories: Array<Category> = [];

  public statusEnum = Status;
  public isAdmin = false;

  constructor(
    private readonly apiService: ApiService,
    private readonly snackbarService: SnackbarService,
    private readonly dialogService: DialogService,
    private readonly cdr: ChangeDetectorRef,
    private readonly activeUserService: ActiveUserService,
    private readonly helpersService: HelpersService,
    private readonly entityExecutionService: EntityExecutionService,
  ) { }

  public ngOnInit(): void {
    this.isAdmin = this.activeUserService.getActiveUser()?.isAdmin || false;
    /* this.dataSource.data = this.buildCategoryTree(this._categories); */
    this.treeData = this.buildCategoryTree(this._categories);
    this.dataSource.data = this.treeData;
    this.treeControl.dataNodes = this.treeData;
  }

  public hasChild = (_: number, node: CategoryNode) => !!node.children && node.children.length > 0;

  public buildCategoryTree(categories: Category[]): CategoryNode[] {
    const map = new Map<string, CategoryNode>();

    // Create a lookup for all categories using both instanceId and uid if available
    categories.forEach((cat) => {
      const node = { ...cat, children: [] };
      if (cat.instanceId) {
        map.set(cat.instanceId, node);
      }
      if (cat.uid) {
        map.set(cat.uid, node);
      }
    });

    const roots: CategoryNode[] = [];

    categories.forEach((cat) => {
      const node = cat.instanceId ? map.get(cat.instanceId) : cat.uid ? map.get(cat.uid) : null;
      if (!node) return;

      if (cat.broader && cat.broader.length > 0) {
        // Each broader reference means this node has a parent
        const parentRef = cat.broader[0]; // Assuming single parent
        const parent = parentRef.instanceId
          ? map.get(parentRef.instanceId)
          : parentRef.uid
            ? map.get(parentRef.uid)
            : null;

        if (parent && parent !== node) {
          if (!parent.children!.some((child) => child.uid === node.uid)) {
            parent.children!.push(node);
          }
        } else {
          // If parent not found or it's itself, treat as root if not already added to roots
          if (!roots.some((r) => r.uid === node.uid)) {
            roots.push(node);
          }
        }
      } else {
        // no parent => root
        if (!roots.some((r) => r.uid === node.uid)) {
          roots.push(node);
        }
      }
    });

    return roots;
  }

  // The node parameter is 'null' when "Add Top-Level Category", has value when creating sub-category
  public onAddCategory(node: CategoryNode | null = null): void {
    this.dialogService.openDialogForComponent(DialogNewCategoryComponent, node || {}, '30vw').then((dialogData) => {
      if (dialogData.dataOut.create === true) {
        //create category
        const category: Category = {
          name: dialogData.dataOut.categoryName,
          description: dialogData.dataOut.categoryDescription || undefined,
          broader: node
            ? [{ instanceId: node.instanceId, entityType: 'CATEGORY', metaId: node.metaId, uid: node.uid }]
            : [],
          uid: `category:${dialogData.dataOut.categoryName}`,
          status: 'DRAFT',
          inScheme: node ? node.inScheme : this.selectedCategoryScheme,
        };

        this.apiService.endpoints.Category.create
          .call(category)
          .then((response) => {
            this.snackbarService.openSnackbar('Category created successfully', 'creation', SnackbarType.SUCCESS);
            this.snackbarService.openSnackbar(
              `Success: "${dialogData.dataOut.categoryName}" category created`,
              'close',
              SnackbarType.SUCCESS,
              6000,
              ['snackbar', 'mat-toolbar', 'snackbar-success'],
            );
            // Insert at root level if no parent node, otherwise insert as child
            if (node) {
              // Pass original category to preserve the name field (API returns empty name)
              this.insertNodeIntoTree(node.uid as string, response, category);
            } else {
              // Pass original category to preserve the name field (API returns empty name)
              this.insertRootNodeIntoTree(response, category);
            }
          })
          .catch(() => {
            this.snackbarService.openSnackbar(
              `Error: failed to create new Category`,
              'close',
              SnackbarType.ERROR,
              6000,
              ['snackbar', 'mat-toolbar', 'snackbar-error'],
            );
          });
      } else {
        //dismiss dialog
      }
    });
  }

  public insertNodeIntoTree(parentUid: string, apiResponse: Category, originalCategory: Category): void {
    const mergedCategory: Category = {
      ...apiResponse,
      name: originalCategory.name, // Preserve the original name
      broader: originalCategory.broader, // Preserve the parent relationship
      inScheme: originalCategory.inScheme, // Preserve the scheme
    };

    // Update the underlying list of categories
    this._categories = [...this._categories, mergedCategory];

    // Rebuild the tree to ensure consistency
    this.treeData = this.buildCategoryTree(this._categories);
    this.dataSource.data = this.treeData;
    this.treeControl.dataNodes = this.treeData;

    // Expand the parent node
    const parentNode = this.findNodeByUid(this.treeData, parentUid);
    if (parentNode) {
      this.treeControl.expand(parentNode);
    }

    this.cdr.detectChanges();

    // Notify parent component that categories have changed
    this.categoryChanged.emit();
  }

  private findNodeByUid(nodes: CategoryNode[], uid: string): CategoryNode | undefined {
    for (const node of nodes) {
      if (node.uid === uid) return node;
      if (node.children?.length) {
        const found = this.findNodeByUid(node.children, uid);
        if (found) return found;
      }
    }
    return undefined;
  }

  public insertRootNodeIntoTree(apiResponse: Category, originalCategory: Category): void {
    // Merge API response with original category to preserve the name field
    // API returns empty name, but we have it in originalCategory
    const mergedCategory: Category = {
      ...apiResponse,
      name: originalCategory.name, // Preserve the original name
      inScheme: originalCategory.inScheme, // Preserve the scheme
    };

    // Add the merged category to the internal _categories array
    this._categories = [...this._categories, mergedCategory];

    // Rebuild the tree from the updated categories
    const newTreeData = this.buildCategoryTree(this._categories);

    this.treeData = newTreeData;

    // Create a new data source instance to force update
    this.dataSource.data = [];
    this.dataSource.data = this.treeData;

    // Update tree control
    this.treeControl.dataNodes = this.treeData;

    // Manually trigger change detection
    this.cdr.detectChanges();

    // Notify parent component that categories have changed
    this.categoryChanged.emit();
  }
  public onRemoveCategory(node: CategoryNode) {
    this.dialogService
      .openConfirmationDialog(
        `Are you sure you want to delete the category "${node.name}"? Category and all its sub-categories will be removed.`,
        true,
      )
      .then((confirmed) => {
        if (confirmed) {
          let newBroader: Array<any> = [];
          if (node.broader && node.broader.length > 0) {
            newBroader = node.broader;
          }
          const updatePromises: Promise<any>[] = [];
          if (node.children && node.children.length > 0) {
            node.children.forEach((child) => {
              // Create a payload to update the child's broader property
              // It's safer to use the spread and remove `children` if it exists to keep all other props
              const payloadToSend = { ...child };
              delete (payloadToSend as any).children;
              payloadToSend.broader = newBroader;

              updatePromises.push(this.apiService.endpoints.Category.update.call(payloadToSend));
            });
          }
          Promise.all(updatePromises)
            .then(() => {
              // All children updated successfully (reparented)
              // Now delete the node
              return this.apiService.deleteEntity(EntityEndpointValue.CATEGORY, node.instanceId || '');
            })
            .then(() => {
              this.snackbarService.openSnackbar(
                `Category "${node.name}" deleted successfully.`,
                'close',
                SnackbarType.SUCCESS,
                6000,
                ['snackbar', 'mat-toolbar', 'snackbar-success'],
              );

              // 4. Update local state
              // Remove the deleted node
              this._categories = this._categories.filter((c) => c.uid !== node.uid);

              // Update the children in the local state to point to the new parent
              if (node.children && node.children.length > 0) {
                const childUids = node.children.map((c) => c.uid);
                this._categories = this._categories.map((cat) => {
                  if (childUids.includes(cat.uid)) {
                    return {
                      ...cat,
                      broader: newBroader,
                    };
                  }
                  return cat;
                });
              }

              // Rebuild the tree
              this.treeData = this.buildCategoryTree(this._categories);
              this.dataSource.data = this.treeData;
              this.treeControl.dataNodes = this.treeData;
              this.cdr.detectChanges();

              // Notify parent component that categories have changed
              this.categoryChanged.emit();
            })
            .catch((error) => {
              console.error('Error deleting category or reparenting children:', error);
              this.snackbarService.openSnackbar(
                `Error deleting category "${node.name}".`,
                'close',
                SnackbarType.ERROR,
                6000,
                ['snackbar', 'mat-toolbar', 'snackbar-error'],
              );
            });
        }
      });
  }

  public toggleSelectedCategory(event: MatCheckboxChange, node: CategoryNode) {
    if (event.checked) {
      //add to selected, chips
      this.selectedCategories.push(node.name || '');
      this.selectedCategoriesObjArr.push(node);
    } else {
      //remove from selected, chips
      this.selectedCategories = this.selectedCategories.filter((name) => name !== node.name);
      this.selectedCategoriesObjArr = this.selectedCategoriesObjArr.filter((cat) => cat.name !== node.name);
    }
    // emits the Array of selected categories to parent, which updates the Data Product with current selection
    this.updateSelectedCategories.emit(this.selectedCategoriesObjArr);
  }

  public isCategorySelected(node: CategoryNode): boolean {
    return this.selectedCategories.includes(node.name as string);
  }

  public userHasEditPermissionsForSubmitted(): boolean {
    // check for User Role - if user not an ADMIN or REVIEWER can see the SUBMITTED, but can't edit them
    if (this.activeEntity !== undefined) {
      const activeUser = this.activeUserService.getActiveUser();
      if (activeUser) {
        const activeUserGroups = activeUser.groups;
        if (activeUserGroups) {
          // find group in UserGroups matching with current active loaded Entity
          const groupMatch = activeUserGroups.find(group => group.groupId === this.activeEntity?.groups?.find(entityGroup => entityGroup === group.groupId));
          if (groupMatch) {
            const userRole = groupMatch.role;
            if (userRole && (userRole === 'ADMIN' || userRole === 'REVIEWER')) {
              return true;
            }
            else {
              return false;
            }
          }
          else {
            return false;
          }
        }
        else {
          return false;
        }
      }
      else {
        return false;
      }
    }
    else {
      return false;
    }
  }
  public canAddSubCategory(node: CategoryNode): boolean {
    return (
      (this.canManageCategories && node.status === Status.DRAFT) ||
      this.entityStatus === Status.DRAFT ||
      (this.entityStatus === Status.SUBMITTED && this.userHasEditPermissionsForSubmitted())
    );
  }

  public onEditCategory(node: CategoryNode): void {
    const dialogDataIn = { ...node, isEditMode: true };
    this.dialogService.openDialogForComponent(DialogNewCategoryComponent, dialogDataIn, '30vw').then((dialogData) => {
      if (dialogData.dataOut.update === true) {
        const payloadToSend: Category = { ...node };
        delete (payloadToSend as any).children; // Remove children property for API
        payloadToSend.name = dialogData.dataOut.categoryName;
        payloadToSend.description = dialogData.dataOut.categoryDescription || undefined;

        this.apiService.endpoints.Category.update
          .call(payloadToSend)
          .then(() => {
            this.snackbarService.openSnackbar('Category updated successfully', 'update', SnackbarType.SUCCESS);
            this.snackbarService.openSnackbar(
              `Success: Category "${dialogData.dataOut.categoryName}" updated`,
              'close',
              SnackbarType.SUCCESS,
              6000,
              ['snackbar', 'mat-toolbar', 'snackbar-success'],
            );

            // Update local state
            this._categories = this._categories.map((c) => {
              if (c.uid === node.uid) {
                return {
                  ...c,
                  name: dialogData.dataOut.categoryName,
                  description: dialogData.dataOut.categoryDescription || undefined,
                };
              }
              return c;
            });

            // Update selected categories if the edited node is selected
            const oldName = node.name;
            const newName = dialogData.dataOut.categoryName;

            if (oldName && this.selectedCategories.includes(oldName)) {
              this.selectedCategories = this.selectedCategories.map((name) => (name === oldName ? newName : name));

              this.selectedCategoriesObjArr = this.selectedCategoriesObjArr.map((cat) => {
                if (cat.uid === node.uid) {
                  return { ...cat, name: newName, description: dialogData.dataOut.categoryDescription || undefined };
                }
                return cat;
              });

              this.updateSelectedCategories.emit(this.selectedCategoriesObjArr);
            }

            this.treeData = this.buildCategoryTree(this._categories);
            this.dataSource.data = this.treeData;
            this.treeControl.dataNodes = this.treeData;
            this.cdr.detectChanges();
            this.categoryChanged.emit();
          })
          .catch((error) => {
            console.error('Error updating category:', error);
            this.snackbarService.openSnackbar(`Error: failed to update Category`, 'close', SnackbarType.ERROR, 6000, [
              'snackbar',
              'mat-toolbar',
              'snackbar-error',
            ]);
          });
      }
    });
  }
  public checkStatus(): boolean {
    if (this.entityStatus === Status.DRAFT || this.entityStatus === Status.SUBMITTED) {
      return false;
    }
    return true;
  }
  public canEditCategory(node: CategoryNode): boolean {
    return (
      node.status === Status.DRAFT ||
      this.entityStatus === Status.DRAFT ||
      ((this.entityStatus === Status.SUBMITTED || node.status === Status.SUBMITTED) && this.userHasEditPermissionsForSubmitted())
    );
  }

  public canAddRootCategory(): boolean {
    if (!this.selectedCategoryScheme) {
      return false;
    }
    return (
      (this.canManageCategories && this.selectedCategoryScheme.status === Status.DRAFT) ||
      this.entityStatus === Status.DRAFT ||
      (this.entityStatus === Status.SUBMITTED && this.userHasEditPermissionsForSubmitted())
    );
  }

  public canRemoveCategory(node: CategoryNode): boolean {
    return this.canManageCategories && (node.status === Status.DRAFT || this.entityStatus === Status.DRAFT);
  }
}
