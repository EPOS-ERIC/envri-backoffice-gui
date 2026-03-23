import { AfterViewInit, Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Subject } from 'rxjs';
import { ApiService } from 'src/apiAndObjects/api/api.service';
import { Entity } from 'src/utility/enums/entity.enum';
import { TableDetail } from 'src/utility/objects/table/detail';
import { TableItem, TableItems } from 'src/utility/objects/table/items';
import { FilterEmit } from '../table-filter/table-filter.component';
import { CUSTOM_DATE_FORMAT } from 'src/utility/config/date';
import moment from 'moment';
import { Status } from 'src/utility/enums/status.enum';
import { DataProductDetailDataSource } from 'src/apiAndObjects/objects/data-source/dataProductDetailDataSource';
import { DistributionDetailDataSource } from 'src/apiAndObjects/objects/data-source/distributionDetailDataSource';
import { SoftwareDetailDataSource } from 'src/apiAndObjects/objects/data-source/softwareDetailDataSource';
import { SourceCodeDetailDataSource } from 'src/apiAndObjects/objects/data-source/sourceCodeDetailDataSource';
import { SnackbarService, SnackbarType } from 'src/services/snackbar.service';

@Component({
  selector: 'app-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.scss'],
})
export class TableComponent implements AfterViewInit {
  @Input() sectionName!: Entity;
  @Output() rowClickDetailsEmit = new Subject<Record<string, string>>();
  @Output() paginationChangeEmit = new EventEmitter<PageEvent>();

  public displayedColumns = ['title', 'changeComment', 'lastChange', 'status', 'author'];
  public dataSource!: MatTableDataSource<TableDetail>;
  public pageSizeOptions = [10, 25, 50, 100];
  public loading = false;

  public editorIdsMapping: Map<string, string> = new Map<string, string>();

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(private apiService: ApiService, private readonly snackbarService: SnackbarService) {}

  private mapTableDetails(items: TableItems): TableDetail[] {
    return items.map((item: TableItem) => ({
      uid: item.uid,
      title: this.checkTitleOrName(item),
      lastChange: moment(item.changeTimestamp).format(CUSTOM_DATE_FORMAT.display.dateInput),
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
      formatStr(titleValue)?.indexOf(formatStr(filters.title)) >= 0
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

  private createTableObjects(items: TableItems) {
    const tableDetails = this.mapTableDetails(items);
    this.initialiseTable(tableDetails);
  }

  private initialiseTable(details: Array<TableDetail>) {
    this.dataSource = new MatTableDataSource(details);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    this.dataSource.filterPredicate = this.filterDataSource;
    this.loading = false;
  }

  public ngAfterViewInit(): void {
    this.loading = true;
    this.apiService.endpoints[this.sectionName].getAll
      .call()
      .then((tableItems) => {
        this.resolveEditorIdsToEditorFullName(tableItems as TableItems).then(() => {
          this.createTableObjects(tableItems as TableItems);
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
  }

  public rowClicked(row: Record<string, string>): void {
    this.rowClickDetailsEmit.next(row);
  }

  public handleFilter(filters: FilterEmit) {
    this.dataSource.filter = JSON.stringify(filters);
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
