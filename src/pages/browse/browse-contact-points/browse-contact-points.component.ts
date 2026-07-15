import { animate, state, style, transition, trigger } from '@angular/animations';
import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ContactPoint, Group, LinkedEntity, Organization } from 'generated/backofficeSchemas';
import { ApiService } from 'src/apiAndObjects/api/api.service';
import { Person } from 'src/apiAndObjects/objects/entities/person.model';
import { DialogService } from 'src/components/dialogs/dialog.service';
import { LoadingService } from 'src/services/loading.service';
import { SnackbarService, SnackbarType } from 'src/services/snackbar.service';
import { ContactPointRole } from 'src/utility/enums/contactPointRole.enum';
import { EntityEndpointValue } from 'src/utility/enums/entityEndpointValue.enum';
import { Status } from 'src/utility/enums/status.enum';
import {
  ContactPointDialogComponent,
  ContactPointDialogData,
} from './contact-point-dialog/contact-point-dialog.component';

interface ContactPointFilters {
  search: string;
  status: string;
  group: string;
}

@Component({
  selector: 'app-browse-contact-points',
  templateUrl: './browse-contact-points.component.html',
  styleUrls: ['./browse-contact-points.component.scss'],
  animations: [
    trigger('detailExpand', [
      state('collapsed,void', style({ height: '0px', minHeight: '0' })),
      state('expanded', style({ height: '*' })),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],
})
export class BrowseContactPointsComponent implements OnInit, AfterViewInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  public readonly displayedColumns = ['expand', 'email', 'role', 'groups', 'status', 'actions'];
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
    this.dataSource.filterPredicate = (contactPoint, filter) => this.matchesFilters(contactPoint, filter);
    this.dataSource.sortingDataAccessor = (contactPoint, property) => this.getSortValue(contactPoint, property);
    this.refreshList();
  }

  public ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  public refreshList(): Promise<void> {
    this.loading = true;
    this.loadingService.setShowSpinner(true);

    return Promise.all([
      this.apiService.endpoints.ContactPoint.getAll.call(undefined, false),
      this.apiService.endpoints.Group.getAll.call(),
      this.apiService.endpoints.Person.getAll.call(undefined, false).catch((error) => {
        console.error('Failed to load people.', error);
        this.showError('Failed to load people. Person selection may be unavailable.');
        return [];
      }),
      this.apiService.endpoints.Organization.getAll.call(undefined, false).catch((error) => {
        console.error('Failed to load organizations.', error);
        this.showError('Failed to load organizations. Organization selection may be unavailable.');
        return [];
      }),
    ])
      .then(([contactPoints, groups, persons, organizations]) => {
        this.groups = groups.sort((first, second) => (first.name || '').localeCompare(second.name || ''));
        this.persons = persons;
        this.organizations = organizations;
        this.dataSource.data = contactPoints;
        this.applyFilters();
      })
      .catch((error) => {
        console.error('Failed to load Contact Points.', error);
        this.showError('Failed to load Contact Points or groups.');
      })
      .finally(() => {
        this.loading = false;
        this.loadingService.setShowSpinner(false);
      });
  }

  public applyFilters(): void {
    this.dataSource.filter = JSON.stringify(this.filters);
    this.dataSource.paginator?.firstPage();
  }

  public toggleRow(contactPoint: ContactPoint): void {
    this.expandedContactPoint = this.expandedContactPoint === contactPoint ? null : contactPoint;
  }

  public handleAdd(): void {
    this.openContactPointDialog();
  }

  public handleEdit(contactPoint: ContactPoint): void {
    this.openContactPointDialog(contactPoint);
  }

  public handleDelete(contactPoint: ContactPoint): void {
    if (!contactPoint.instanceId) {
      this.showError('This Contact Point cannot be deleted because it has no instance ID.');
      return;
    }

    const label = this.getPrimaryEmail(contactPoint) || contactPoint.uid || contactPoint.instanceId;
    this.dialogService
      .openConfirmationDialog(`Are you sure you want to delete Contact Point "${label}"?`, true, 'warn')
      .then((confirmed) => {
        if (!confirmed) return;

        this.loadingService.setShowSpinner(true);
        this.apiService
          .deleteEntity(EntityEndpointValue.CONTACT_POINT, contactPoint.instanceId as string)
          .then(() => {
            this.showSuccess(`Contact Point "${label}" deleted successfully.`);
            return this.refreshList();
          })
          .catch((error) => {
            console.error('Failed to delete Contact Point.', error);
            this.showError(`Failed to delete Contact Point "${label}".`);
          })
          .finally(() => this.loadingService.setShowSpinner(false));
      });
  }

  public getPrimaryEmail(contactPoint: ContactPoint): string {
    return contactPoint.email?.[0] || '';
  }

  public getRoleLabel(role: string | undefined): string {
    return role && role in ContactPointRole ? ContactPointRole[role as keyof typeof ContactPointRole] : role || '-';
  }

  public getGroupNames(groupIds: string[] | undefined): string {
    if (!groupIds?.length) return '-';
    return groupIds.map((groupId) => this.groups.find((group) => group.id === groupId)?.name || groupId).join(', ');
  }

  public getPersonLabel(person: LinkedEntity | undefined): string {
    if (!person) return '-';
    const match = this.persons.find((item) => this.matchesReference(item, person));
    return match ? [match.givenName, match.familyName].filter(Boolean).join(' ') || match.uid || '-' : person.uid || person.metaId || '-';
  }

  public getOrganizationLabel(organization: LinkedEntity | undefined): string {
    if (!organization) return '-';
    const match = this.organizations.find((item) => this.matchesReference(item, organization));
    return match ? match.legalName?.[0] || match.acronym || match.uid || '-' : organization.uid || organization.metaId || '-';
  }

  private openContactPointDialog(contactPoint?: ContactPoint): void {
    if (this.groups.length === 0) {
      this.showError('At least one group must be available to manage Contact Points.');
      return;
    }

    const data: ContactPointDialogData = {
      contactPoint,
      groups: this.groups,
    };

    this.dialogService
      .openDialogForComponent(ContactPointDialogComponent, data, 'auto', 'auto', 'contact-point-dialog')
      .then((response) => {
        const payload = response.dataOut as ContactPoint | undefined;
        if (!payload?.role || !payload.groups?.length || !(payload.email?.length || payload.telephone?.length)) return;
        if (contactPoint) {
          this.updateContactPoint(payload);
        } else {
          this.createContactPoint(payload);
        }
      });
  }

  private createContactPoint(payload: ContactPoint): void {
    this.loadingService.setShowSpinner(true);
    this.apiService.endpoints.ContactPoint.create
      .call({ ...payload, status: Status.PUBLISHED })
      .then(() => {
        this.showSuccess('Contact Point created and published successfully.');
        return this.refreshList();
      })
      .catch((error) => {
        console.error('Failed to create Contact Point.', error);
        this.showError('Failed to create Contact Point.');
      })
      .finally(() => this.loadingService.setShowSpinner(false));
  }

  private updateContactPoint(payload: ContactPoint): void {
    this.loadingService.setShowSpinner(true);
    this.apiService.endpoints.ContactPoint.update
      .call(payload)
      .then(() => {
        this.showSuccess('Contact Point updated successfully.');
        return this.refreshList();
      })
      .catch((error) => {
        console.error('Failed to update Contact Point.', error);
        this.showError('Failed to update Contact Point.');
      })
      .finally(() => this.loadingService.setShowSpinner(false));
  }

  private matchesFilters(contactPoint: ContactPoint, serializedFilters: string): boolean {
    const filters = JSON.parse(serializedFilters) as ContactPointFilters;
    const searchableText = [
      ...(contactPoint.email || []),
      ...(contactPoint.telephone || []),
      contactPoint.role || '',
      this.getRoleLabel(contactPoint.role),
      this.getPersonLabel(contactPoint.person),
      this.getOrganizationLabel(contactPoint.organization),
      this.getGroupNames(contactPoint.groups),
    ]
      .join(' ')
      .toLocaleLowerCase();

    return (
      searchableText.includes(filters.search.trim().toLocaleLowerCase()) &&
      (!filters.status || contactPoint.status === filters.status) &&
      (!filters.group || contactPoint.groups?.includes(filters.group) === true)
    );
  }

  private getSortValue(contactPoint: ContactPoint, property: string): string {
    switch (property) {
      case 'email':
        return this.getPrimaryEmail(contactPoint).toLocaleLowerCase();
      case 'role':
        return this.getRoleLabel(contactPoint.role).toLocaleLowerCase();
      case 'groups':
        return this.getGroupNames(contactPoint.groups).toLocaleLowerCase();
      case 'status':
        return contactPoint.status || '';
      default:
        return '';
    }
  }

  private matchesReference(
    entity: { instanceId?: string; metaId?: string; uid?: string },
    reference: LinkedEntity,
  ): boolean {
    return Boolean(
      (reference.instanceId && entity.instanceId === reference.instanceId) ||
      (reference.metaId && entity.metaId === reference.metaId) ||
      (reference.uid && entity.uid === reference.uid),
    );
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
