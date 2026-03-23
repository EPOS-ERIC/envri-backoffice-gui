import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DialogData } from '../baseDialogService.abstract';
import { ActiveUserService } from 'src/services/activeUser.service';
import { Group } from 'generated/backofficeSchemas';
import { ApiService } from 'src/apiAndObjects/api/api.service';
import { CategoryNode } from 'src/components/categoryTree/categoryTree.component';

interface NewCategoryDialog {
  categoryName: string;
  categoryDescription?: string;
  create?: boolean;
  update?: boolean;
}

@Component({
  selector: 'app-dialog-new-category',
  templateUrl: './dialog-new-category.component.html',
  styleUrls: ['./dialog-new-category.component.scss'],
})
export class DialogNewCategoryComponent {
  public groups: Array<Group> = [];
  public selectedGroup!: Group | null;

  public categoryName: string = '';
  public categoryDescription: string = '';
  public isEditMode: boolean = false;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: DialogData<CategoryNode & { isEditMode?: boolean }, NewCategoryDialog>,
    private activeUserService: ActiveUserService,
    private apiService: ApiService,
  ) {
    if (this.data.dataIn?.isEditMode) {
      this.isEditMode = true;
      this.categoryName = this.data.dataIn.name || '';
      this.categoryDescription = this.data.dataIn.description || '';
    }
  }

  public handleCancel(): void {
    this.data.dataOut.update = false;
    this.data.dataOut.create = false;
    this.data.close();
  }

  public handleAction(): void {
    this.data.dataOut.categoryName = this.categoryName!;
    this.data.dataOut.categoryDescription = this.categoryDescription;
    this.data.dataOut.update = this.isEditMode;
    this.data.dataOut.create = !this.isEditMode;
    this.data.close();
  }
}
