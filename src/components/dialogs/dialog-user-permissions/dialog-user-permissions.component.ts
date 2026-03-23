import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { ApiService } from 'src/apiAndObjects/api/api.service';
import { SnackbarService, SnackbarType } from 'src/services/snackbar.service';
import { UserRole } from 'src/utility/enums/UserRole.enum';
import { DialogData } from '../baseDialogService.abstract';
import { Group, User, UserGroup } from 'generated/backofficeSchemas';

@Component({
  selector: 'app-dialog-user-permissions',
  templateUrl: './dialog-user-permissions.component.html',
  styleUrls: ['./dialog-user-permissions.component.scss'],
})
export class DialogUserPermissionsComponent implements OnInit {
  public userDetails!: User;
  public userRole = UserRole;
  public currentRole = '';

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: DialogData<{ user: User; group: Group; statusType: string }>,
    private apiService: ApiService,
    private snackbarService: SnackbarService,
  ) {}

  ngOnInit(): void {
    this.initData();
  }

  private getUserRole = (user: User) => user.groups?.find((group: UserGroup) => group.role);

  private initData(): void {
    const user: User = this.data.dataIn.user;
    this.userDetails = user;
    switch (true) {
      case this.getUserRole(user)?.role === UserRole.ADMIN:
        this.currentRole = UserRole.ADMIN;
        break;
      case this.getUserRole(user)?.role === UserRole.EDITOR:
        this.currentRole = UserRole.EDITOR;
        break;
      case this.getUserRole(user)?.role === UserRole.REVIEWER:
        this.currentRole = UserRole.REVIEWER;
        break;
      case this.getUserRole(user)?.role === UserRole.VIEWER:
        this.currentRole = UserRole.VIEWER;
        break;
    }
  }

  public setNewUserRole(currentRole: string): void {
    // const params: SetUserRoleParams = {
    //   authIdentifier: this.data.dataIn.user.authIdentifier as string,
    //   email: this.data.dataIn.user.email as string,
    //   firstName: this.data.dataIn.user.firstName as string,
    //   groups: [
    //     {
    //       groupId: this.data.dataIn.group.id as string,
    //       role: currentRole,
    //     },
    //   ],
    //   isAdmin: this.data.dataIn.user.isAdmin as boolean,
    //   lastName: this.data.dataIn.user.lastName as string,
    // };

    this.apiService.endpoints.Group.updateUserInGroup
      .call({
        groupid: this.data.dataIn.group.id as string,
        statusType: this.data.dataIn.statusType,
        userid: this.data.dataIn.user.authIdentifier as string,
        role: currentRole,
      })
      .then(() => {
        this.snackbarService.openSnackbar('Successfully updated user status.', 'close', SnackbarType.SUCCESS, 3000, [
          'snackbar',
          'mat-toolbar',
          'snackbar-success',
        ]);
        this.data.close();
        this.data.dataOut = true;
      })
      .catch((err) => {
        console.error(err);
        this.snackbarService.openSnackbar('Error updating user status.', 'close', SnackbarType.ERROR, 3000, [
          'snackbar',
          'mat-toolbar',
          'snackbar-error',
        ]);
      });
  }

  public cancel(): void {
    this.data.dataOut = false;
    this.data.close();
  }
}
