import { Component } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { ContactPoint, Group, Organization } from 'generated/backofficeSchemas';
import { Person } from 'src/apiAndObjects/objects/entities/person.model';
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
export class BrowseECVComponent {

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
    private readonly snackbarService: SnackbarService,
  ) { }

  public applyFilters(): void {
    this.dataSource.filter = JSON.stringify(this.filters);
    this.dataSource.paginator?.firstPage();
  }

  public handleAdd(): void {
  }

  public handleEdit(): void {
  }

  public handleDelete(): void {
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
