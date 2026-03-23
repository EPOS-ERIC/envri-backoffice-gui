import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSelectChange } from '@angular/material/select';
import { MatTableDataSource } from '@angular/material/table';
import { Group, User, UserGroup } from 'generated/backofficeSchemas';
import { concatMap, forkJoin, from, map, Observable } from 'rxjs';
import { ApiService } from 'src/apiAndObjects/api/api.service';
import { UserInfoDataSource } from 'src/apiAndObjects/objects/data-source/userInfoDataSource';
import { Entity } from 'src/utility/enums/entity.enum';
import { groupOptions, statusOptions } from './static';
import { SnackbarService, SnackbarType } from 'src/services/snackbar.service';
import { DialogService } from 'src/components/dialogs/dialog.service';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { DialogData } from 'src/components/dialogs/baseDialogService.abstract';

interface CollatedGroup {
  id?: string;
  description?: string;
  name?: string;
  users?: User[];
}

@Component({
  selector: 'app-browse-groups',
  templateUrl: './browse-groups.component.html',
  styleUrls: ['./browse-groups.component.scss'],
  animations: [
    trigger('detailExpand', [
      state('collapsed,void', style({ height: '0px', minHeight: '0' })),
      state('expanded', style({ height: '*' })),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],
})
export class BrowseGroupsComponent implements OnInit {
  @ViewChild('userGroupsPaginator') userGroupsPaginator!: MatPaginator;
  @ViewChild('allGroupsPaginator') allGroupsPaginator!: MatPaginator;
  @ViewChild('dynamicCell', { static: false }) dynamicCell!: ElementRef;

  private currentUserId!: string;
  private readonly userAdminGroups: string[] = [];
  public displayedColumns: string[] = ['id', 'name', 'description', 'role', 'status', 'actions', 'userid'];
  public allGroupsColumns: string[] = ['id', 'name', 'description'];
  public nestedColumns: string[] = ['name', 'email', 'status', 'role', 'remove'];
  public dataSource: MatTableDataSource<Group> = new MatTableDataSource();
  public allGroupsDataSource: MatTableDataSource<CollatedGroup> = new MatTableDataSource();
  public pageSizeOptions = [10, 25, 50, 100];
  public isUserAdmin = false;
  public userGroupsLoading = false;
  public allGroupsLoading = false;
  public filters = {
    status: '',
    groupName: '',
  };
  public statusOptions = statusOptions;
  public groupOptions = groupOptions;
  public expandedElement: any;
  public columnsToDisplayWithExpand = [...this.allGroupsColumns, 'expand'];

  constructor(
    private readonly apiService: ApiService,
    private readonly snackbarService: SnackbarService,
    private readonly dialogService: DialogService,
  ) {}

  public ngOnInit(): void {
    this.initData();
    this.getAllGroupsAndUsers();
  }

  private filterDataSource(data: CollatedGroup | undefined, filterValue: string): boolean {
    const filters = JSON.parse(filterValue);
    const formatStr = (str: string) => str.trim().toLocaleLowerCase();
    return formatStr(data?.name as string).indexOf(formatStr(filters.groupName)) >= 0;
  }

  private getUserGroups(user: UserInfoDataSource): Observable<Group[][]> {
    const requests: Promise<Group[]>[] = [];
    user.groups.forEach((group: UserGroup) => {
      if (group.role === 'ADMIN' && group.groupId) {
        this.userAdminGroups.push(group.groupId);
      }
      requests.push(
        this.apiService.endpoints[Entity.GROUP].get
          .call(
            {
              instanceId: group.groupId as string,
            },
            false,
          )
          .then((data: Group[]) => {
            data[0].id = group.groupId;
            return data;
          }),
      );
    });
    this.currentUserId = user.authIdentifier;
    return forkJoin(requests);
  }

  private getDetailedUserInfo(groupData: Group[][], userId: string): void {
    const groups = groupData.flat();
    // Use the groups assigned to the user to populate the first table.
    const userGroups = groups
      .filter((group) => group.users?.find((user) => user['userId'] === this.currentUserId))
      .map((group: Group) => {
        return {
          id: group.id,
          name: group.name,
          description: group.description,
          role: group.users?.find((user) => user['userId'] === this.currentUserId)?.['role'],
          status: group.users?.find((user) => user['userId'] === this.currentUserId)?.['requestStatus'],
          userid: userId,
        };
      });
    this.userGroupsLoading = false;
    this.initTables({ userGroups });
  }

  private collateByGroup(users: User[], groups: Group[]): CollatedGroup[] {
    const userMap = new Map(users.map((user) => [user.authIdentifier, user]));

    return groups.map((group) => {
      const final: User[] = (group.users || [])
        .map((user) => {
          const userItem = userMap.get(user['userId']);
          return userItem ? { ...userItem, ...user } : undefined; // Change `null` to `undefined`
        })
        .filter((user): user is User => user !== undefined); // Type-safe filter to remove undefined values

      return {
        id: group.id,
        description: group.description,
        name: group.name,
        users: final, // Now strictly typed as User[]
      };
    });
  }

  private getAllGroupsAndUsers(): void {
    this.allGroupsLoading = true;
    forkJoin({
      users: this.apiService.endpoints.User.getAll.call(),
      groups: this.apiService.endpoints.Group.getAll.call(),
    }).subscribe((data) => {
      this.allGroupsLoading = false;
      const tableData = this.collateByGroup(data.users, data.groups);
      this.initTables({ userGroups: undefined, allGroups: tableData });
    });
  }

  private initData(): void {
    this.userGroupsLoading = true;
    from(this.apiService.endpoints[Entity.USER].get.call({ available_section: true }))
      .pipe(
        // Step 1: Fetch user groups
        concatMap((user) => {
          this.isUserAdmin = user.isAdmin;
          return this.getUserGroups(user).pipe(
            // Combine users and group data into one object
            map((groups) => {
              return { user, groups };
            }),
          );
        }),
      )
      .subscribe((data: { user: UserInfoDataSource; groups: Group[][] }) => {
        this.getDetailedUserInfo(data.groups, data.user.authIdentifier);
      });
  }

  private initTables(data: { userGroups?: Group[]; allGroups?: CollatedGroup[] }): void {
    const filteredGroups = data.allGroups?.filter((group) => group.id && this.userAdminGroups.includes(group.id));
    if (data.userGroups) {
      this.dataSource.data = data.userGroups;
      this.dataSource.paginator = this.userGroupsPaginator;
    }
    if (data.allGroups) {
      this.allGroupsDataSource.data = filteredGroups ?? [];
      this.allGroupsDataSource.paginator = this.allGroupsPaginator;
      this.allGroupsDataSource.filterPredicate = this.filterDataSource;
    }
  }

  public handleFilterByStatus(event: MatSelectChange): void {
    this.filters.status = event.value;
  }

  public handleViewResults(): void {
    this.allGroupsDataSource.filter = JSON.stringify(this.filters);
  }

  public handleClear(): void {
    this.filters.status = '';
    this.filters.groupName = '';
    this.allGroupsDataSource.filter = '';
  }

  public handleLeaveGroup(groupId: string, userId: string): void {
    this.dialogService
      .openConfirmationDialog(`Are you sure you want to leave this group?`, true, 'warn')
      .then((confirmed) => {
        if (confirmed) {
          this.apiService.endpoints.Group.removeUserFromGroup
            .call({
              userid: userId,
              groupid: groupId,
            })
            .then(() => {
              this.snackbarService.openSnackbar(
                'Successfully removed user from group.',
                'Close',
                SnackbarType.SUCCESS,
                3000,
                ['snackbar', 'mat-toolbar', 'snackbar-success'],
              );
              this.initData();
              this.userAdminGroups.splice(this.userAdminGroups.indexOf(groupId), 1);
              this.getAllGroupsAndUsers();
            })
            .catch((err) => {
              this.snackbarService.openSnackbar('Error removing user from group.', 'Close', SnackbarType.ERROR, 3000, [
                'snackbar',
                'mat-toolbar',
                'snackbar-error',
              ]);
              console.error(err);
            });
        }
      });
  }

  public handleRemoveUserFromGroup(parentElement: ElementRef, userId: string): void {
    this.dialogService
      .openConfirmationDialog('Are you sure you want to remove this user?', true, 'warn')
      .then((confirmed) => {
        if (confirmed) {
          this.apiService.endpoints.Group.removeUserFromGroup
            .call({
              groupid: parentElement.nativeElement.innerText,
              userid: userId,
            })
            .then(() => {
              this.snackbarService.openSnackbar(
                'Successfully removed user from group.',
                'Close',
                SnackbarType.SUCCESS,
                3000,
                ['snackbar', 'mat-toolbar', 'snackbar-success'],
              );
              this.getAllGroupsAndUsers();
            })
            .catch((err) => {
              console.error(err);
              this.snackbarService.openSnackbar('Error removing user from group.', 'Close', SnackbarType.ERROR, 3000, [
                'snackbar',
                'mat-toolbar',
                'snackbar-error',
              ]);
            });
        }
      });
  }

  public handleUpdateUserRole(userId: string, group: Group, statusType: string): void {
    this.apiService.endpoints.User.getUserById
      .call({ instance_id: userId })
      .then((user: User) => {
        this.dialogService.openChangeUserRoleDialog({ user, group, statusType }).then((dialogData: DialogData) => {
          if (dialogData.dataOut) {
            this.getAllGroupsAndUsers();
          }
        });
      })
      .catch((err) => {
        console.error(err);
        this.snackbarService.openSnackbar('Error updating user role.', 'Close', SnackbarType.ERROR, 3000, [
          'snackbar',
          'mat-toolbar',
          'snackbar-error',
        ]);
      });
  }

  public handleUpdateUserStatus(userId: string, group: Group, currentStatus: string): void {
    this.dialogService
      .openUpdateStatusDialog(currentStatus)
      .then((dialogData: DialogData<string, string | undefined>) => {
        const newStatus = dialogData.dataOut;
        if (newStatus) {
          this.apiService.endpoints.Group.updateUserInGroup
            .call({
              groupid: group.id as string,
              statusType: newStatus,
              userid: userId,
              role: group.users?.find((user) => user['userId'] === userId)?.['role'] as string,
            })
            .then(() => {
              this.snackbarService.openSnackbar(
                'Successfully updated user status.',
                'close',
                SnackbarType.SUCCESS,
                3000,
                ['snackbar', 'mat-toolbar', 'snackbar-success'],
              );
              this.getAllGroupsAndUsers();
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
      });
  }
}
