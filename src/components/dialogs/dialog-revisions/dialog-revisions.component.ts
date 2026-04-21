import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ApiService } from 'src/apiAndObjects/api/api.service';
import { Entity } from 'src/utility/enums/entity.enum';
import { DialogData } from '../baseDialogService.abstract';
import { Router } from '@angular/router';
import { SelectionModel } from '@angular/cdk/collections';
import { EntityEndpointValue } from 'src/utility/enums/entityEndpointValue.enum';
import { CUSTOM_DATE_FORMAT } from 'src/utility/config/date';
import moment from 'moment';
import { HelpersService } from 'src/services/helpers.service';
import { DataProduct, SoftwareApplication, SoftwareSourceCode } from 'generated/backofficeSchemas';
import { TableItem, TableItems } from 'src/utility/objects/table/items';

interface CurrentEntity {
  metaId: string;
  type: Entity;
  instanceId: string;
}

export interface RevisionBase {
  instanceId: string;
  metaId: string;
  uid: string;
  version: string;
  editorId: string;
  title: string;
}
// Revision DataProduct
export interface Revision extends RevisionBase {
  /* instanceId: string;
  metaId: string;
  uid: string;
  version: string; */
  status: DataProduct['status'];
  /* created: Date | string; */
  /* editorId: string;
  title: string; */
}
// Revision SoftwareApplication
export interface RevisionSA extends RevisionBase {
  /* instanceId: string;
  metaId: string;
  uid: string;
  version: string; */
  status: SoftwareApplication['status'];
  /* editorId: string;
  title: string; */
}
// Revision SoftwareSourceCode
export interface RevisionSSC extends RevisionBase {
  /* instanceId: string;
  metaId: string;
  uid: string;
  version: string; */
  status: SoftwareSourceCode['status'];
  /* editorId: string;
  title: string; */
}

@Component({
  selector: 'app-dialog-revisions',
  templateUrl: './dialog-revisions.component.html',
  styleUrls: ['./dialog-revisions.component.scss'],
})
export class DialogRevisionsComponent implements OnInit {
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: DialogData<CurrentEntity>,
    private apiService: ApiService,
    private router: Router,
    private dialogRef: MatDialogRef<DialogRevisionsComponent>,
    private helpersService: HelpersService,
  ) {}

  private entities!: Array<DataProduct> | Array<SoftwareApplication> | Array<SoftwareSourceCode>;
  public selection = new SelectionModel<Revision | RevisionSA | RevisionSSC>(true, []);
  public displayedColumns: string[] = [
    'select',
    'instanceId',
    'uid',
    // 'version',
    'state',
    'lastChanged',
    'editorId',
    'link',
  ];
  public dataSource!: MatTableDataSource<Revision> | MatTableDataSource<RevisionSA> | MatTableDataSource<RevisionSSC>;
  public pageSizeOptions = [10, 25, 50, 100];
  public loading = false;

  public editorIdsMapping: Map<string, string> = new Map<string, string>();

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  private _initTable(data: Array<Revision> | Array<RevisionSA> | Array<RevisionSSC>): void {
    this.establishColumnsToDisplay();
    this.dataSource = new MatTableDataSource(data);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  private getRelatedEntities(): void {
    const metaId = this.data.dataIn.metaId;
    switch (true) {
      case this.data.dataIn.type === Entity.DATA_PRODUCT:
        this.apiService.endpoints.DataProduct.getAllVersions
          .call(
            {
              metaId: metaId,
            },
            false,
          )
          .then((data: Array<DataProduct>) => {
            this.resolveEditorIdsToEditorFullName(data)
              .then(() => {
                this.entities = data;
                const revisions: Revision[] = data.map((item) => {
                  return {
                    instanceId: item.instanceId as string,
                    metaId: item.metaId as string,
                    uid: item.uid as string,
                    version: item.versionInfo as string,
                    status: item.status,
                    lastChanged: moment(item.changeTimestamp).format(CUSTOM_DATE_FORMAT.display.dateInput),
                    editorId: this.editorIdsMapping.has(item.editorId as string)
                      ? this.editorIdsMapping.get(item.editorId as string)!
                      : item.editorId ?? 'unknown',
                    title: item.title?.[0] as string,
                  };
                });
                this.loading = false;
                this._initTable(revisions);
              })
              .catch(() => {
                console.error("Couldn't resolve editorIds to Editor Full Names");
              });
          });
        break;
      case this.data.dataIn.type === Entity.SOFTWARE_APPLICATION:
        this.apiService.endpoints.SoftwareApplication.getAllVersions
          .call(
            {
              metaId: metaId,
            },
            false,
          )
          .then((data: Array<SoftwareApplication>) => {
            console.debug('DialogRevisionsComponent', data);

            this.resolveEditorIdsToEditorFullName(data).then(() => {
              this.entities = data;
              const revisions: RevisionSA[] = data.map((item) => {
                return {
                  instanceId: item.instanceId as string,
                  metaId: item.metaId as string,
                  uid: item.uid as string,
                  version: item.softwareVersion as string,
                  status: item.status,
                  lastChanged: moment(item.changeTimestamp).format(CUSTOM_DATE_FORMAT.display.dateInput),
                  editorId: this.editorIdsMapping.has(item.editorId as string)
                    ? this.editorIdsMapping.get(item.editorId as string)!
                    : (item.editorId as string) ?? 'Unknown',
                  title: item.name || 'unknown',
                };
              });
              this.loading = false;
              this._initTable(revisions);
            });
          });
        break;
      case this.data.dataIn.type === Entity.SOFTWARE_SOURCE_CODE:
        this.apiService.endpoints.SoftwareSourceCode.getAllVersions
          .call(
            {
              metaId: metaId,
            },
            false,
          )
          .then((data: Array<SoftwareSourceCode>) => {
            console.debug('DialogRevisionsComponent', data);

            this.resolveEditorIdsToEditorFullName(data).then(() => {
              this.entities = data;
              const revisions: RevisionSSC[] = data.map((item) => {
                return {
                  instanceId: item.instanceId as string,
                  metaId: item.metaId as string,
                  uid: item.uid as string,
                  version: item.softwareVersion as string,
                  status: item.status,
                  lastChanged: moment(item.changeTimestamp).format(CUSTOM_DATE_FORMAT.display.dateInput),
                  editorId: this.editorIdsMapping.has(item.editorId as string)
                    ? this.editorIdsMapping.get(item.editorId as string)!
                    : (item.editorId as string) ?? 'Uknown',
                  title: item.name || 'unknown',
                };
              });
              this.loading = false;
              this._initTable(revisions);
            });
          });
        break;
    }
  }

  private establishColumnsToDisplay(): void {
    switch (this.data.dataIn.type) {
      case Entity.DATA_PRODUCT:
        this.displayedColumns = [
          'select',
          'instanceId',
          'uid',
          // 'version',
          'state',
          'lastChanged',
          'editorId',
          'link',
        ];
        break;
      // SSC and SA displaying same columns
      case Entity.SOFTWARE_SOURCE_CODE:
      case Entity.SOFTWARE_APPLICATION:
        this.displayedColumns = [
          'select',
          'instanceId',
          'uid',
          // 'version',
          'state',
          'lastChanged',
          'editorId',
          'link',
        ];
        break;
    }
  }

  ngOnInit(): void {
    this.loading = true;
    this.getRelatedEntities();
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

  public allSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows;
  }

  public masterToggle() {
    this.allSelected() ? this.selection.clear() : this.dataSource.data.forEach((row) => this.selection.select(row));
  }

  public handleNavigate(metaID: string, instanceId: string): void {
    if (this.data.dataIn.type === Entity.DATA_PRODUCT) {
      this.router.navigate([`/browse/${EntityEndpointValue.DATA_PRODUCT}/details`, metaID, instanceId]);
    } else if (this.data.dataIn.type === Entity.SOFTWARE_APPLICATION) {
      this.router.navigate([`/browse/${EntityEndpointValue.APPLICATION_SOFTWARE}/details`, metaID, instanceId]);
    } else if (this.data.dataIn.type === Entity.SOFTWARE_SOURCE_CODE) {
      this.router.navigate([`/browse/${EntityEndpointValue.SOFTWARE_SOURCE_CODE}/details`, metaID, instanceId]);
    }
    this.data.close();
  }

  public handleCompare(): void {
    const instanceIds = this.selection.selected.map((item) => item.instanceId);
    let selectedRevisions: DataProduct[] | SoftwareApplication[] | SoftwareSourceCode[] = [];
    if (this.data.dataIn.type === Entity.DATA_PRODUCT) {
      const selectedRevisionsDP = this.entities.filter((item) => instanceIds.includes(item.instanceId as string)) as DataProduct[];
      selectedRevisions = selectedRevisionsDP as DataProduct[];
    } else if (this.data.dataIn.type === Entity.SOFTWARE_APPLICATION) {
      const selectedRevisionsSA = this.entities.filter((item) =>
        instanceIds.includes(item.instanceId as string),
      ) as SoftwareApplication[];
      selectedRevisions = selectedRevisionsSA as SoftwareApplication[];
    } else if (this.data.dataIn.type === Entity.SOFTWARE_SOURCE_CODE) {
      const selectedRevisionsSSC = this.entities.filter((item) =>
        instanceIds.includes(item.instanceId as string),
      ) as SoftwareSourceCode[];
      selectedRevisions = selectedRevisionsSSC as SoftwareSourceCode[];
    }

    // Sort selected revisions by timestamp to ensure chronological order (Old -> New)
    (selectedRevisions as any[]).sort((a, b) => {
      const dateA = new Date(a.changeTimestamp || 0).getTime();
      const dateB = new Date(b.changeTimestamp || 0).getTime();
      return dateA - dateB;
    });

    this.dialogRef.close();
    this.router.navigate(['/browse/revisions/compare', this.data?.dataIn.instanceId]);
    this.helpersService.setRevisions(selectedRevisions);
  }
}
