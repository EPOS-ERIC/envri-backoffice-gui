import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DialogData } from '../baseDialogService.abstract';
import { ActiveUserService } from 'src/services/activeUser.service';
import { Group } from 'generated/backofficeSchemas';
import { ApiService } from 'src/apiAndObjects/api/api.service';
import { Entity } from 'src/utility/enums/entity.enum';

interface NewEntityDialog {
  create: boolean;
  group: Group | undefined;
}

interface IncomingEntityType {
  entityType: Entity.DATA_PRODUCT | Entity.SOFTWARE_APPLICATION | Entity.SOFTWARE_SOURCE_CODE;
}

@Component({
  selector: 'app-dialog-new-entity',
  templateUrl: './dialog-new-entity.component.html',
  styleUrls: ['./dialog-new-entity.component.scss'],
})
export class DialogNewEntityComponent {
  public groups: Array<Group> = [];
  public selectedGroup!: Group | null;

  public entityName = 'UnknownEntityType';
  // this variable holds the '/all' Group response (not filtered)
  public groupsAll: Array<Group> = [];
  // flag signalling if groups 'ALL' has been loaded (for SA and SSC)
  public groupSoftwaresLoaded: boolean = false;
  public groupsLoading: boolean = false;
  public groupsLoadFailed: boolean = false;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: DialogData<null | IncomingEntityType, NewEntityDialog>,
    private activeUserService: ActiveUserService,
    private apiService: ApiService,
  ) {
    if (data.dataIn?.entityType === Entity.DATA_PRODUCT) {
      this.entityName = Entity.DATA_PRODUCT;
    } else if (data.dataIn?.entityType === Entity.SOFTWARE_APPLICATION) {
      this.entityName = Entity.SOFTWARE_APPLICATION;
    } else if (data.dataIn?.entityType === Entity.SOFTWARE_SOURCE_CODE) {
      this.entityName = Entity.SOFTWARE_SOURCE_CODE;
    }

    const userIds = this.activeUserService
      .getActiveUser()
      ?.groups?.map((group) => (group.groupId ? group.groupId : ''));

    if (null != userIds) {
      this.getUserRelevantGroups(userIds);
    }
  }

  public handleCancel(): void {
    this.data.dataOut.create = false;
    this.data.close();
  }

  public handleCreate(): void {
    this.data.dataOut.group = this.selectedGroup!;
    this.data.dataOut.create = true;
    this.data.close();
  }

  private getUserRelevantGroups(userIds: Array<string>): void {
    this.groupsLoading = true;
    this.groupsLoadFailed = false;
    this.apiService.endpoints.Group.getAll
      .call()
      .then((allGroups: Array<Group>) => {
        // save the full response from API before filtering
        // also if SA or SSC, assign the 'Softwares' group to selectedGroup and assign 'true' to 'groupAllLoaded' flag
        if (this.entityName === Entity.SOFTWARE_APPLICATION || this.entityName === Entity.SOFTWARE_SOURCE_CODE) {
          this.groupsAll = allGroups.filter((group) => group.name?.toLowerCase() === 'softwares');
          this.selectedGroup = this.groupsAll[0];
          this.groupSoftwaresLoaded = true;
        }
        // now filter
        this.groups = allGroups.filter((group) => userIds.some((userIds) => group.id === userIds));
      })
      .catch(() => {
        this.groups = [];
        this.groupsLoadFailed = true;
      })
      .finally(() => {
        this.groupsLoading = false;
      });
  }
}
