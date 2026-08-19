import { AfterViewInit, Component, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { ContactPoint, Group, LinkedEntity, Organization } from 'generated/backofficeSchemas';
import { ApiService } from 'src/apiAndObjects/api/api.service';
import { Person } from 'src/apiAndObjects/objects/entities/person.model';
import { DialogService } from 'src/components/dialogs/dialog.service';
import { LoadingService } from 'src/services/loading.service';
import { SnackbarService, SnackbarType } from 'src/services/snackbar.service';

interface ContactPointFilters {
  search: string;
  status: string;
  group: string;
}

@Component({
  selector: 'app-browse-ecv',
  templateUrl: './browse-ecv.component.html',
  styleUrls: ['./browse-ecv.component.scss'],
  animations: [
  ],
})
export class BrowseECVComponent implements OnInit, AfterViewInit {

  public readonly displayedColumns = ['  '];
  public readonly columnsToDisplayWithExpand = [...this.displayedColumns];
  public readonly pageSizeOptions = [10, 25, 50, 100];
  public readonly statusOptions: Array<ContactPoint['status']> = [
    'DRAFT',
    'SUBMITTED',
    'PUBLISHED',
    'PENDING',
    'ARCHIVED',
    'DISCARDED',
  ];

  public dataSource = new MatTableDataSource<ContactPoint>([]);
  public groups: Group[] = [];
  public persons: Person[] = [];
  public organizations: Organization[] = [];
  public expandedContactPoint: ContactPoint | null = null;
  public loading = false;
  public filters: ContactPointFilters = { search: '', status: '', group: '' };

  constructor(
    private readonly apiService: ApiService,
    private readonly dialogService: DialogService,
    private readonly loadingService: LoadingService,
    private readonly snackbarService: SnackbarService,
  ) { }

  public ngOnInit(): void {
    
  }

  public ngAfterViewInit(): void {

  }

  public applyFilters(): void {
    this.dataSource.filter = JSON.stringify(this.filters);
    this.dataSource.paginator?.firstPage();
  }

  public handleAdd(): void {
  }

  public handleEdit(contactPoint: ContactPoint): void {
  }

  public handleDelete(contactPoint: ContactPoint): void {
  }

  private showSuccess(message: string): void {
    this.snackbarService.openSnackbar(message, 'close', SnackbarType.SUCCESS, 6000, [
      'snackbar',
      'mat-toolbar',
      'snackbar-success',
    ]);
  }

  private showError(message: string): void {
    this.snackbarService.openSnackbar(message, 'close', SnackbarType.ERROR, 6000, [
      'snackbar',
      'mat-toolbar',
      'snackbar-error',
    ]);
  }
}
