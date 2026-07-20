import { AfterViewInit, Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Subject } from 'rxjs';
import { filter, take } from 'rxjs/operators';
import { ApiService } from 'src/apiAndObjects/api/api.service';
import { Entity } from 'src/utility/enums/entity.enum';
import { TableDetail } from 'src/utility/objects/table/detail';
import { TableItem, TableItems } from 'src/utility/objects/table/items';
import { FilterEmit } from '../table-filter/table-filter.component';
import { CUSTOM_DATE_FORMAT } from 'src/utility/config/date';
import moment from 'moment';
import { Status } from 'src/utility/enums/status.enum';
import { ActiveUserService } from 'src/services/activeUser.service';
import { DataProductDetailDataSource } from 'src/apiAndObjects/objects/data-source/dataProductDetailDataSource';
import { DistributionDetailDataSource } from 'src/apiAndObjects/objects/data-source/distributionDetailDataSource';
import { SoftwareDetailDataSource } from 'src/apiAndObjects/objects/data-source/softwareDetailDataSource';
import { SourceCodeDetailDataSource } from 'src/apiAndObjects/objects/data-source/sourceCodeDetailDataSource';
import { SnackbarService, SnackbarType } from 'src/services/snackbar.service';
import { DialogService } from 'src/components/dialogs/dialog.service';
import { Router } from '@angular/router';
import { Group, UserGroup } from 'generated/backofficeSchemas';

@Component({
  selector: 'app-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.scss'],
})
export class TableComponent implements AfterViewInit {
  @Input() sectionName!: Entity;
  @Output() rowClickDetailsEmit = new Subject<Record<string, string>>();
  @Output() paginationChangeEmit = new EventEmitter<PageEvent>();

  public displayedColumns = ['title', 'lastChange', 'status', 'author'];
  public dataSource!: MatTableDataSource<TableDetail>;
  public pageSizeOptions = [10, 25, 50, 100];
  public loading = false;

  public editorIdsMapping: Map<string, string> = new Map<string, string>();
  public groupIdsMapping: Map<string, string> = new Map<string, string>();

  public groupFilterOptions: string[] = [];

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private apiService: ApiService,
    private readonly snackbarService: SnackbarService,
    private readonly activeUserService: ActiveUserService,
    private readonly dialogService: DialogService,
    private readonly router: Router
  ) { }

  private mapTableDetails(items: TableItems): TableDetail[] {
    return items.map((item: TableItem) => ({
      uid: item.uid,
      title: this.checkTitleOrName(item),
      group: this.groupIdsMapping.has(item.groups?.[0] as string)
        ? this.groupIdsMapping.get(item.groups?.[0] as string)
        : item.groups?.[0],
      lastChange: moment(item.changeTimestamp).format(CUSTOM_DATE_FORMAT.display.dateInput),
      changeTimestamp: item.changeTimestamp as string,
      status: item.status as Status,
      changeComment: item.changeComment,
      author: this.editorIdsMapping.has(item.editorId as string)
        ? this.editorIdsMapping.get(item.editorId as string)
        : item.editorId,
      instanceId: item.instanceId as string,
      metaId: item.metaId as string,
      dataProduct: item instanceof DistributionDetailDataSource ? item.dataProduct?.[0] : undefined,
    }));
  }

  // check if response contains Name or Title property (e.g. DataProducts have 'Title' property, SoftwareApplication have 'Name' property)
  private checkTitleOrName(item: TableItem): string {
    if (item instanceof DataProductDetailDataSource || item instanceof DistributionDetailDataSource) {
      return item.title?.[0] ?? '';
    } else if (item instanceof SoftwareDetailDataSource || item instanceof SourceCodeDetailDataSource) {
      return item.name ?? '';
    }
    return '';
  }

  private filterDataSource(data: TableDetail, filterValue: string): boolean {
    const titleValue = Array.isArray(data.title) ? data.title[0] ?? '' : data.title ?? '';
    const filters = JSON.parse(filterValue);
    const formatStr = (str: string) => str?.trim().toLocaleLowerCase();
    return (
      formatStr(data.status as string).indexOf(formatStr(filters.status)) >= 0 &&
      formatStr(titleValue)?.indexOf(formatStr(filters.title)) >= 0 &&
      formatStr(data.author as string)?.indexOf(formatStr(filters.author)) >= 0 &&
      formatStr(data.group as string)?.indexOf(formatStr(filters.group)) >= 0
    );
  }

  private resolveEditorIdsToEditorFullName(items: TableItems): Promise<void> {
    const editorIds = items.reduce<string[]>((acc: string[], item: TableItem) => {
      const editorId = item.editorId;

      if (typeof editorId === 'string' && editorId !== '' && editorId.toLowerCase() !== 'ingestor') {
        acc.push(editorId);
      }

      return acc;
    }, []);

    const uniqueEditorIds: string[] = Array.from(new Set<string>(editorIds));

    const requests = uniqueEditorIds.map((editorId) => {
      const userId = { instance_id: editorId };
      return this.apiService.endpoints.User.getUserById
        .call(userId)
        .then((userInfo) => {
          const firstName = userInfo.firstName ?? '';
          const lastName = userInfo.lastName ?? '';
          const fullName = `${firstName} ${lastName}`.trim();

          if (fullName.length > 0) {
            this.editorIdsMapping.set(editorId, fullName);
          }
        })
        .catch(() => {
          console.warn("Couldn't resolve editorId to Full Name.");
        });
    });

    return Promise.all(requests).then(() => undefined);
  }

  private resolveGroupIdsToGroupFullName(items: Array<UserGroup>): Promise<void> {
    const groupIdsCleaned: string[] = [];
    // push actual groupIds into new Array containing only that information (stripped from 'role' property)
    items.forEach(userGroup => {
      groupIdsCleaned.push(userGroup.groupId as string);
    })
    const groupIds = groupIdsCleaned;

    const requests = groupIds.map((groupId: string) => {
      const groupIdent = { instanceId: groupId };
      return this.apiService.endpoints.Group.get
        .call(groupIdent)
        .then((groupInfo: Group[]) => {
          // there's only one item in this Array, so accessing 0 index directly
          const groupName = groupInfo[0]?.name ?? '';

          if (groupName !== '') {
            this.groupIdsMapping.set(groupId, groupName);
            // push into Filter Options Array to be passed to child
            this.groupFilterOptions.push(groupName);
          }
        })
        .catch(() => {
          console.warn("Couldn't resolve groupId to Group Name.");
        });
    });

    return Promise.all(requests).then(() => { undefined; });
  }

  private createTableObjects(items: TableItems) {
    const tableDetails = this.mapTableDetails(items);
    this.initialiseTable(tableDetails);
  }

  private initialiseTable(details: Array<TableDetail>) {
    this.dataSource = new MatTableDataSource(details);
    this.dataSource.paginator = this.paginator;
    this.dataSource.filterPredicate = this.filterDataSource;

    this.dataSource.sortingDataAccessor = (row: TableDetail, column: string) => {
      if (column === 'lastChange') {
        return row.changeTimestamp ? new Date(row.changeTimestamp).getTime() : 0;
      }
      if (column === 'title') {
        const titleValue = Array.isArray(row.title) ? row.title[0] ?? '' : row.title ?? '';
        return titleValue.toLowerCase();
      }
      const value = (row as unknown as Record<string, unknown>)[column];
      return typeof value === 'string' ? value.toLowerCase() : (value as number ?? 0);
    };

    if (!this.sort.active) {
      this.sort.active = 'lastChange';
      this.sort.direction = 'desc';
    }
    this.dataSource.sort = this.sort;
    this.loading = false;
  }

  public ngAfterViewInit(): void {
    this.activeUserService.activeUserInfoObservable
      .pipe(
        filter((user) => user !== null),
        take(1)
      )
      .subscribe((user) => {
        // Check if user has any active groups (groups with a role assigned)
        const activeGroups = user?.groups?.filter((g) => !!g.role) || [];

        if (activeGroups.length === 0) {
          this.dataSource = new MatTableDataSource<TableDetail>([]);
          this.loading = false;
          this.dialogService
            .openConfirmationDialog(
              "You're not a member of a group. Please ensure you are a member of a group. Proceed to Groups page?"
            )
            .then((accepted: boolean) => {
              if (accepted) {
                this.router.navigate(['groups']);
              }
            });
          return;
        }

        this.loading = true;
        this.apiService.endpoints[this.sectionName].getAll
          .call()
          .then((tableItems) => {
            this.resolveEditorIdsToEditorFullName(tableItems as TableItems).then(() => {
              this.resolveGroupIdsToGroupFullName(activeGroups as Array<UserGroup>).then(() => {
                this.createTableObjects(tableItems as TableItems);
              });
            });
          })
          .catch(() => {
            this.snackbarService.openSnackbar(
              `Failed to load data, please try again later.`,
              'close',
              SnackbarType.ERROR,
              6000,
              ['snackbar', 'mat-toolbar', 'snackbar-error'],
            );
          });
      });
  }

  public rowClicked(row: Record<string, string>): void {
    this.rowClickDetailsEmit.next(row);
  }

  public handleFilter(filters: FilterEmit) {
    if (null != this.dataSource) {
      this.dataSource.filter = JSON.stringify(filters);
    }
  }

  public handleClear(): void {
    if (null != this.dataSource) {
      this.dataSource.filter = '';
    }
  }

  public handlePaginationChange(event: PageEvent): void {
    this.paginationChangeEmit.emit(event);
  }
}
