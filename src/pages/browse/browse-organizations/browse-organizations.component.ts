import { animate, state, style, transition, trigger } from '@angular/animations';
import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Address, ContactPoint, Group, Identifier, LinkedEntity, Organization } from 'generated/backofficeSchemas';
import { ApiService } from 'src/apiAndObjects/api/api.service';
import { DialogService } from 'src/components/dialogs/dialog.service';
import { LoadingService } from 'src/services/loading.service';
import { SnackbarService, SnackbarType } from 'src/services/snackbar.service';
import { EntityEndpointValue } from 'src/utility/enums/entityEndpointValue.enum';
import { Status } from 'src/utility/enums/status.enum';
import {
  OrganizationDialogComponent,
  OrganizationDialogData,
  OrganizationDialogResult,
  OrganizationIdentifierField,
} from './organization-dialog/organization-dialog.component';

interface OrganizationFilters {
  search: string;
  status: string;
  group: string;
}

@Component({
  selector: 'app-browse-organizations',
  templateUrl: './browse-organizations.component.html',
  styleUrls: ['./browse-organizations.component.scss'],
  animations: [
    trigger('detailExpand', [
      state('collapsed,void', style({ height: '0px', minHeight: '0' })),
      state('expanded', style({ height: '*' })),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],
})
export class BrowseOrganizationsComponent implements OnInit, AfterViewInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  public readonly displayedColumns = ['expand', 'legalName', 'logo', 'status', 'actions'];
  public readonly columnsToDisplayWithExpand = [...this.displayedColumns];
  public readonly pageSizeOptions = [10, 25, 50, 100];
  public readonly statusOptions: Array<Organization['status']> = [
    'DRAFT',
    'SUBMITTED',
    'PUBLISHED',
    'PENDING',
    'ARCHIVED',
    'DISCARDED',
  ];

  public dataSource = new MatTableDataSource<Organization>([]);
  public groups: Group[] = [];
  public identifiers: Identifier[] = [];
  public addresses: Address[] = [];
  public contactPoints: ContactPoint[] = [];
  public organizations: Organization[] = [];
  public failedLogoUrls = new Set<string>();
  public expandedOrganization: Organization | null = null;
  public loading = false;
  public filters: OrganizationFilters = { search: '', status: '', group: '' };

  constructor(
    private readonly apiService: ApiService,
    private readonly dialogService: DialogService,
    private readonly loadingService: LoadingService,
    private readonly snackbarService: SnackbarService,
  ) {}

  public ngOnInit(): void {
    this.dataSource.filterPredicate = (organization, filter) => this.matchesFilters(organization, filter);
    this.dataSource.sortingDataAccessor = (organization, property) => this.getSortValue(organization, property);
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
      this.apiService.endpoints.Organization.getAll.call(undefined, false),
      this.apiService.endpoints.Group.getAll.call(),
      this.apiService.endpoints.Identifier.getAll.call(),
      this.apiService.endpoints.Address.getAll.call(),
      this.apiService.endpoints.ContactPoint.getAll.call(undefined, false),
    ])
      .then(([organizations, groups, identifiers, addresses, contactPoints]) => {
        this.organizations = organizations;
        this.groups = groups.sort((first, second) => (first.name || '').localeCompare(second.name || ''));
        this.identifiers = identifiers;
        this.addresses = addresses;
        this.contactPoints = contactPoints;
        this.dataSource.data = organizations;
        this.applyFilters();
      })
      .catch((error) => {
        console.error('Failed to load Organizations.', error);
        this.showError('Failed to load Organizations or their related records.');
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

  public toggleRow(organization: Organization): void {
    this.expandedOrganization = this.expandedOrganization === organization ? null : organization;
  }

  public handleAdd(): void {
    this.openOrganizationDialog();
  }

  public handleEdit(organization: Organization): void {
    this.openOrganizationDialog(organization);
  }

  public handleDelete(organization: Organization): void {
    if (!organization.instanceId) {
      this.showError('This Organization cannot be deleted because it has no instance ID.');
      return;
    }

    const label = this.getOrganizationLabel(organization);
    this.dialogService
      .openConfirmationDialog(`Are you sure you want to delete Organization "${label}"?`, true, 'warn')
      .then((confirmed) => {
        if (!confirmed) return;

        this.loadingService.setShowSpinner(true);
        this.apiService
          .deleteEntity(EntityEndpointValue.ORGANIZATION, organization.instanceId as string)
          .then(() => {
            this.showSuccess(`Organization "${label}" deleted successfully.`);
            return this.refreshList();
          })
          .catch((error) => {
            console.error('Failed to delete Organization.', error);
            this.showError(`Failed to delete Organization "${label}".`);
          })
          .finally(() => this.loadingService.setShowSpinner(false));
      });
  }

  public getOrganizationLabel(organization: Organization): string {
    return organization.legalName?.[0] || organization.acronym || organization.uid || organization.instanceId || '-';
  }

  public hasLogoLoadError(logo: string): boolean {
    return this.failedLogoUrls.has(logo);
  }

  public handleLogoError(logo: string): void {
    this.failedLogoUrls = new Set([...this.failedLogoUrls, logo]);
  }

  public getIdentifierLabels(references: LinkedEntity[] | undefined): string {
    return this.getReferenceLabels(references, this.identifiers, (identifier) => {
      return [identifier.type, identifier.identifier].filter(Boolean).join(': ') || identifier.uid || '-';
    });
  }

  public getGroupNames(groupIds: string[] | undefined): string {
    if (!groupIds?.length) return '-';
    return groupIds.map((groupId) => this.groups.find((group) => group.id === groupId)?.name || groupId).join(', ');
  }

  public getAddressLabel(reference: LinkedEntity | undefined): string {
    if (!reference) return '-';
    const address = this.addresses.find((item) => this.matchesReference(item, reference));
    return address
      ? [address.street, address.postalCode, address.locality, address.country, address.countryCode]
          .filter(Boolean)
          .join(', ') || address.uid || '-'
      : reference.uid || reference.metaId || '-';
  }

  public getContactPointLabels(references: LinkedEntity[] | undefined): string {
    return this.getReferenceLabels(references, this.contactPoints, (contactPoint) => {
      return contactPoint.email?.[0] || contactPoint.telephone?.[0] || contactPoint.uid || '-';
    });
  }

  public getParentLabels(references: LinkedEntity[] | undefined): string {
    return this.getReferenceLabels(references, this.organizations, (organization) => this.getOrganizationLabel(organization));
  }

  private openOrganizationDialog(organization?: Organization): void {
    const data: OrganizationDialogData = {
      organization,
      address: organization?.address
        ? this.addresses.find((address) => this.matchesReference(address, organization.address as LinkedEntity))
        : undefined,
      identifierEntities: this.identifiers,
      contactPoints: this.contactPoints,
      allOrganizations: this.organizations,
      parentOrganizations: this.organizations.filter(
        (item) => item.status === Status.PUBLISHED && (!organization || !this.matchesReference(item, organization)),
      ),
    };

    this.dialogService
      .openDialogForComponent(OrganizationDialogComponent, data, '720px', 'auto', 'organization-dialog')
      .then((response) => {
        const payload = response.dataOut as OrganizationDialogResult | undefined;
        if (!payload?.identifierFields?.length) return;

        if (organization) {
          this.updateOrganization(payload.organization, payload.identifierFields, payload.address);
        } else {
          this.createOrganization(payload.organization, payload.identifierFields, payload.address);
        }
      });
  }

  private createOrganization(
    payload: Organization,
    identifierFields: OrganizationIdentifierField[],
    address: Address | undefined,
  ): void {
    this.loadingService.setShowSpinner(true);
    const groups = this.groups.map((group) => group.id).filter((id): id is string => Boolean(id));
    Promise.all([this.synchronizeIdentifiers(identifierFields, groups, payload), this.saveAddress(address, groups)])
      .then(([identifier, savedAddress]) =>
        this.apiService.endpoints.Organization.create.call({
          ...payload,
          address: savedAddress ? this.toReference(savedAddress, 'ADDRESS') : undefined,
          identifier,
          groups,
          status: Status.PUBLISHED,
        }),
      )
      .then(() => {
        this.showSuccess('Organization created and published successfully.');
        return this.refreshList();
      })
      .catch((error) => {
        console.error('Failed to create Organization.', error);
        this.showError('Failed to create Organization.');
      })
      .finally(() => this.loadingService.setShowSpinner(false));
  }

  private updateOrganization(
    payload: Organization,
    identifierFields: OrganizationIdentifierField[],
    address: Address | undefined,
  ): void {
    this.loadingService.setShowSpinner(true);
    Promise.all([
      this.synchronizeIdentifiers(identifierFields, payload.groups || [], payload),
      this.saveAddress(address, payload.groups || []),
    ])
      .then(([identifier, savedAddress]) =>
        this.apiService.endpoints.Organization.update.call({
          ...payload,
          address: savedAddress ? this.toReference(savedAddress, 'ADDRESS') : undefined,
          identifier,
        }),
      )
      .then(() => {
        this.showSuccess('Organization updated successfully.');
        return this.refreshList();
      })
      .catch((error) => {
        console.error('Failed to update Organization.', error);
        this.showError('Failed to update Organization.');
      })
      .finally(() => this.loadingService.setShowSpinner(false));
  }

  private saveAddress(address: Address | undefined, groups: string[]): Promise<Address | undefined> {
    if (!address) return Promise.resolve(undefined);

    const body: Address = {
      ...address,
      groups: address.groups?.length ? address.groups : groups,
      status: address.status || Status.PUBLISHED,
    };
    return address.instanceId
      ? this.apiService.endpoints.Address.update.call(body)
      : this.apiService.endpoints.Address.create.call(body);
  }

  private synchronizeIdentifiers(
    fields: OrganizationIdentifierField[],
    groups: string[],
    organization: Organization,
  ): Promise<LinkedEntity[]> {
    const identifierRequests = fields.map((field) => {
      const body: Identifier = {
        ...(field.existing || {}),
        identifier: field.identifier.trim(),
        type: field.type.trim(),
      };

      return field.existing
        ? this.apiService.endpoints.Identifier.update.call(body)
        : this.apiService.endpoints.Identifier.create.call({ ...body, groups, status: Status.PUBLISHED });
    });

    const submittedExisting = fields
      .filter((field) => field.existing)
      .map((field) => field.existing as Identifier);
    const removedIdentifiers = (organization.identifier || []).filter(
      (reference) => !submittedExisting.some((identifier) => this.matchesReference(identifier, reference)),
    );
    const removedRequests = removedIdentifiers
      .filter((reference) => Boolean(reference.instanceId))
      .map((reference) => this.apiService.deleteEntity(EntityEndpointValue.IDENTIFIER, reference.instanceId as string));

    return Promise.all([...identifierRequests, ...removedRequests]).then((responses) => {
      const updatedIdentifiers = responses.slice(0, identifierRequests.length) as Identifier[];
      return updatedIdentifiers.map((identifier) => ({
        entityType: 'IDENTIFIER',
        instanceId: identifier.instanceId,
        metaId: identifier.metaId,
        uid: identifier.uid,
      }));
    });
  }

  private matchesFilters(organization: Organization, serializedFilters: string): boolean {
    const filters = JSON.parse(serializedFilters) as OrganizationFilters;
    const searchableText = [
      ...(organization.legalName || []),
    ]
      .join(' ')
      .toLocaleLowerCase();

    return (
      searchableText.includes(filters.search.trim().toLocaleLowerCase()) &&
      (!filters.status || organization.status === filters.status) &&
      (!filters.group || organization.groups?.includes(filters.group) === true)
    );
  }

  private getSortValue(organization: Organization, property: string): string {
    switch (property) {
      case 'legalName':
        return this.getOrganizationLabel(organization).toLocaleLowerCase();
      case 'logo':
        return organization.logo || '';
      case 'status':
        return organization.status || '';
      default:
        return '';
    }
  }

  private getReferenceLabels<T extends { instanceId?: string; metaId?: string; uid?: string }>(
    references: LinkedEntity[] | undefined,
    entities: T[],
    getLabel: (entity: T) => string,
  ): string {
    if (!references?.length) return '-';
    return references
      .map((reference) => {
        const entity = entities.find((item) => this.matchesReference(item, reference));
        return entity ? getLabel(entity) : reference.uid || reference.metaId || reference.instanceId || '-';
      })
      .join(', ');
  }

  private matchesReference(
    entity: { instanceId?: string; metaId?: string; uid?: string },
    reference: LinkedEntity | Organization,
  ): boolean {
    return Boolean(
      (reference.instanceId && entity.instanceId === reference.instanceId) ||
      (reference.metaId && entity.metaId === reference.metaId) ||
      (reference.uid && entity.uid === reference.uid),
    );
  }

  private toReference(
    entity: { instanceId?: string; metaId?: string; uid?: string },
    entityType: string,
  ): LinkedEntity {
    return {
      entityType,
      instanceId: entity.instanceId,
      metaId: entity.metaId,
      uid: entity.uid,
    };
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
