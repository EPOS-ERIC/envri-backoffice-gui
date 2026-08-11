import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { Component, Inject, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatChipInputEvent } from '@angular/material/chips';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Address, ContactPoint, Identifier, LinkedEntity, Organization } from 'generated/backofficeSchemas';
import { DialogData } from 'src/components/dialogs/baseDialogService.abstract';
import { Status } from 'src/utility/enums/status.enum';

export interface OrganizationDialogData {
  organization?: Organization;
  address?: Address;
  identifierEntities: Identifier[];
  contactPoints: ContactPoint[];
  allOrganizations: Organization[];
  parentOrganizations: Organization[];
}

export interface OrganizationIdentifierField {
  existing?: Identifier;
  type: string;
  identifier: string;
}

export interface OrganizationDialogResult {
  organization: Organization;
  address?: Address;
  identifierFields: OrganizationIdentifierField[];
}

@Component({
  selector: 'app-organization-dialog',
  templateUrl: './organization-dialog.component.html',
  styleUrls: ['./organization-dialog.component.scss'],
})
export class OrganizationDialogComponent implements OnInit {
  public readonly separatorKeysCodes = [ENTER, COMMA];
  public form!: FormGroup;
  public parentSelectionError = false;
  public contactPointSearch = '';
  public memberOfSearch = '';
  public contactPoints: ContactPoint[] = [];
  public parentOrganizations: Organization[] = [];
  public filteredContactPoints: ContactPoint[] = [];
  public filteredParentOrganizations: Organization[] = [];

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: DialogData<OrganizationDialogData, OrganizationDialogResult | undefined>,
    private readonly formBuilder: FormBuilder,
  ) {}

  public ngOnInit(): void {
    const organization = this.data.dataIn.organization;
    const address = this.data.dataIn.address;
    this.contactPoints = [...this.data.dataIn.contactPoints].sort((first, second) =>
      this.getContactPointLabel(first).localeCompare(this.getContactPointLabel(second)),
    );
    this.parentOrganizations = [...this.data.dataIn.parentOrganizations].sort((first, second) =>
      this.getOrganizationLabel(first).localeCompare(this.getOrganizationLabel(second)),
    );
    this.filteredContactPoints = this.contactPoints;
    this.filteredParentOrganizations = this.parentOrganizations;
    this.form = this.formBuilder.group({
      identifier: this.createIdentifierArray(organization?.identifier),
      legalName: [organization?.legalName?.[0] || ''],
      leiCode: [organization?.leiCode || ''],
      email: [this.uniqueValues(organization?.email)],
      telephone: [this.uniqueValues(organization?.telephone)],
      street: [address?.street || ''],
      locality: [address?.locality || ''],
      postalCode: [address?.postalCode || ''],
      country: [address?.country || ''],
      countryCode: [address?.countryCode || ''],
      logo: [organization?.logo || ''],
      contactPoint: [this.getSelectedEntities(organization?.contactPoint, this.contactPoints)],
      memberOf: [this.getSelectedEntities(organization?.memberOf, this.parentOrganizations)],
    });
  }

  public get isEditMode(): boolean {
    return Boolean(this.data.dataIn.organization);
  }

  public get identifierArray(): FormArray {
    return this.form.controls['identifier'] as FormArray;
  }

  public get emails(): string[] {
    return this.form.controls['email'].value as string[];
  }

  public get telephones(): string[] {
    return this.form.controls['telephone'].value as string[];
  }

  public getIdentifierLabel(identifier: Identifier): string {
    return [identifier.type, identifier.identifier].filter(Boolean).join(': ') || identifier.uid || '-';
  }

  public getIdentifierControls(): FormGroup[] {
    return this.identifierArray.controls as FormGroup[];
  }

  public addIdentifier(): void {
    this.identifierArray.push(this.createIdentifierGroup());
  }

  public removeIdentifier(index: number): void {
    if (this.identifierArray.length > 1) this.identifierArray.removeAt(index);
  }

  public getContactPointLabel(contactPoint: ContactPoint): string {
    return contactPoint.email?.[0] || contactPoint.telephone?.[0] || contactPoint.uid || contactPoint.instanceId || '-';
  }

  public getOrganizationLabel(organization: Organization): string {
    return organization.legalName?.[0] || organization.acronym || organization.uid || organization.instanceId || '-';
  }

  public filterContactPoints(search: string): void {
    const normalizedSearch = search.trim().toLocaleLowerCase();
    const selected = (this.form.controls['contactPoint'].value || []) as ContactPoint[];
    this.filteredContactPoints = this.contactPoints.filter(
      (contactPoint) =>
        selected.includes(contactPoint) ||
        this.getContactPointLabel(contactPoint).toLocaleLowerCase().includes(normalizedSearch),
    );
  }

  public filterParentOrganizations(search: string): void {
    const normalizedSearch = search.trim().toLocaleLowerCase();
    const selected = (this.form.controls['memberOf'].value || []) as Organization[];
    this.filteredParentOrganizations = this.parentOrganizations.filter(
      (organization) =>
        selected.includes(organization) ||
        this.getOrganizationLabel(organization).toLocaleLowerCase().includes(normalizedSearch),
    );
  }

  public addValue(event: MatChipInputEvent, controlName: 'email' | 'telephone'): void {
    const value = event.value.trim();
    if (value) {
      const values = this.form.controls[controlName].value as string[];
      if (!values.includes(value)) {
        this.form.controls[controlName].setValue([...values, value]);
      }
    }
    event.chipInput.clear();
  }

  public removeValue(value: string, controlName: 'email' | 'telephone'): void {
    const values = this.form.controls[controlName].value as string[];
    this.form.controls[controlName].setValue(values.filter((item) => item !== value));
  }

  public handleCancel(): void {
    this.data.dataOut = undefined;
    this.data.close();
  }

  public handleSave(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const formValue = this.form.getRawValue();
    const parents = formValue.memberOf as Organization[];
    this.parentSelectionError = this.createsParentCycle(parents);
    if (this.parentSelectionError) {
      this.form.controls['memberOf'].setErrors({ cycle: true });
      return;
    }

    const address: Address = {
      ...(this.data.dataIn.address || {}),
      street: formValue.street.trim(),
      locality: formValue.locality.trim(),
      postalCode: formValue.postalCode.trim(),
      country: formValue.country.trim(),
      countryCode: formValue.countryCode.trim(),
    };
    const hasAddress = Boolean(
      this.data.dataIn.address ||
        address.street ||
        address.locality ||
        address.postalCode ||
        address.country ||
        address.countryCode,
    );

    this.data.dataOut = {
      organization: {
        ...(this.data.dataIn.organization || {}),
        legalName: formValue.legalName.trim() ? [formValue.legalName.trim()] : [],
        leiCode: formValue.leiCode.trim() || undefined,
        email: formValue.email as string[],
        telephone: formValue.telephone as string[],
        logo: formValue.logo.trim() || undefined,
        contactPoint: (formValue.contactPoint as ContactPoint[]).map((contactPoint) =>
          this.toReference(contactPoint, 'CONTACTPOINT'),
        ),
        memberOf: parents.map((organization) => this.toReference(organization, 'ORGANIZATION')),
        status: this.data.dataIn.organization?.status || Status.PUBLISHED,
      },
      address: hasAddress ? address : undefined,
      identifierFields: formValue.identifier as OrganizationIdentifierField[],
    };
    this.data.close();
  }

  public handleParentSelectionChange(): void {
    this.parentSelectionError = false;
    this.form.controls['memberOf'].setErrors(null);
    this.filterParentOrganizations(this.memberOfSearch);
  }

  private createsParentCycle(parents: Organization[]): boolean {
    const organization = this.data.dataIn.organization;
    if (!organization?.instanceId) return false;

    const parentMap = new Map<string, LinkedEntity[]>();
    this.data.dataIn.allOrganizations.forEach((item) => {
      if (item.instanceId) parentMap.set(item.instanceId, item.memberOf || []);
    });
    parentMap.set(organization.instanceId, parents.map((parent) => this.toReference(parent, 'ORGANIZATION')));

    const reachesCurrentOrganization = (reference: LinkedEntity, visited: Set<string>): boolean => {
      const parent = this.data.dataIn.allOrganizations.find((item) => this.matchesReference(item, reference));
      if (!parent?.instanceId) return false;
      if (parent.instanceId === organization.instanceId) return true;
      if (visited.has(parent.instanceId)) return false;

      visited.add(parent.instanceId);
      return (parentMap.get(parent.instanceId) || []).some((nextParent) => reachesCurrentOrganization(nextParent, visited));
    };

    return parents.some((parent) => reachesCurrentOrganization(this.toReference(parent, 'ORGANIZATION'), new Set<string>()));
  }

  private toReference(entity: { instanceId?: string; metaId?: string; uid?: string }, entityType: string): LinkedEntity {
    return {
      entityType,
      instanceId: entity.instanceId,
      metaId: entity.metaId,
      uid: entity.uid,
    };
  }

  private createIdentifierArray(references: LinkedEntity[] | undefined): FormArray {
    const rows = (references || [])
      .map((reference) => this.data.dataIn.identifierEntities.find((identifier) => this.matchesReference(identifier, reference)))
      .filter((identifier): identifier is Identifier => Boolean(identifier))
      .map((identifier) => this.createIdentifierGroup(identifier));
    return new FormArray(rows.length > 0 ? rows : [this.createIdentifierGroup()]);
  }

  private createIdentifierGroup(identifier?: Identifier): FormGroup {
    return new FormGroup({
      existing: new FormControl(identifier),
      type: new FormControl(identifier?.type || '', Validators.required),
      identifier: new FormControl(identifier?.identifier || '', Validators.required),
    });
  }

  private getSelectedEntities<T extends { instanceId?: string; metaId?: string; uid?: string }>(
    references: LinkedEntity[] | undefined,
    entities: T[],
  ): T[] {
    return entities.filter((entity) => references?.some((reference) => this.matchesReference(entity, reference)));
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

  private uniqueValues(values: string[] | undefined): string[] {
    return Array.from(new Set((values || []).map((value) => value.trim()).filter(Boolean)));
  }
}
