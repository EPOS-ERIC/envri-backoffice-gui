import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { LinkedEntity, ContactPoint, SoftwareApplication } from 'generated/backofficeSchemas';
import { map, Observable, startWith } from 'rxjs';
import { ApiService } from 'src/apiAndObjects/api/api.service';
import { WithSubscription } from 'src/helpers/subscription';
import { ActiveUserService } from 'src/services/activeUser.service';
import { EntityExecutionService } from 'src/services/calls/entity-execution.service';
import { SnackbarService, SnackbarType } from 'src/services/snackbar.service';
import { StateChangeService } from 'src/services/stateChange.service';
import { ContactPointRole } from 'src/utility/enums/contactPointRole.enum';
import { Entity } from 'src/utility/enums/entity.enum';
import { Status } from 'src/utility/enums/status.enum';

@Component({
  selector: 'app-contact-point-search-appSoft',
  templateUrl: './contact-point-search-appSoft.component.html',
  styleUrl: './contact-point-search-appSoft.component.scss',
})
export class ContactPointSearchAppSoftComponent extends WithSubscription implements OnInit {
  @Input() contactPoint: Array<LinkedEntity> | undefined = [];

  @Output() contactPointDetailsUpdated = new EventEmitter<Array<LinkedEntity>>();

  @Output() addedContactPointDetail = new EventEmitter<ContactPoint>();

  @Output() isLoadingObs = new EventEmitter<boolean>();

  public form!: FormGroup;

  public contactPointFilteredOptions!: Observable<ContactPoint[]>;

  public contactPointRoleOptions: Array<{ id: string; name: string }> = [];

  public contactPointAll: ContactPoint[] | null = [];

  public selectedContactPoint: ContactPoint | null = null;

  constructor(
    private readonly apiService: ApiService,
    private readonly snackbarService: SnackbarService,
    private readonly stateChangeService: StateChangeService,
    private readonly formBuilder: FormBuilder,
    private readonly entityExecutionService: EntityExecutionService,
    private readonly activeUserService: ActiveUserService,
  ) {
    super();
  }

  private initSubscriptions(): void {
    this.subscribe(
      this.stateChangeService.currentSoftwareApplicationStateObs,
      (status: SoftwareApplication['status'] | undefined) => {
        if (status == null || (status === Status.SUBMITTED && !this.userHasEditPermissionsForSubmitted()) || status === Status.PUBLISHED || status === Status.ARCHIVED) {
          this.form.disable();
        }
      },
    );
  }

  public userHasEditPermissionsForSubmitted(): boolean{
    // check for User Role - if user not an ADMIN or REVIEWER can see the SUBMITTED, but can't edit them
    const softwareApplication = this.entityExecutionService.getActiveSoftwareApplicationValue();
    const activeUser = this.activeUserService.getActiveUser();
    if(activeUser){
      const activeUserGroups = activeUser.groups;
      if(activeUserGroups){
        // find group in UserGroups matching with current active loaded Entity
        const groupMatch = activeUserGroups.find(group => group.groupId === softwareApplication?.groups?.find(entityGroup => entityGroup === group.groupId));
        if(groupMatch){
          const userRole = groupMatch.role;
          if(userRole && (userRole === 'ADMIN' || userRole === 'REVIEWER')){
            return true;
          }
          else{
            return false;
          }
        }
        else{
          return false;
        }
      }
      else{
        return false;
      }
    }
    else{
      return false;
    }
  }

  private initForm(): void {
    this.form = this.formBuilder.group({
      contactPoint: new FormControl(),
      role: new FormControl(this.contactPointRoleOptions[0].id),
    });
  }

  private trackFormChanges(): void {
    const roleControl = this.form.get('role');
    const contactPointControl = this.form.get('contactPoint');

    if (roleControl && contactPointControl) {
      this.subscribe(roleControl.valueChanges, () => {
        this.selectedContactPoint = null;

        if ((contactPointControl.value ?? '') !== '') {
          contactPointControl.setValue('');
        }
      });
    }

    this.contactPointFilteredOptions = this.form.valueChanges.pipe(
      startWith(this.form.getRawValue()),
      map((changes) => {
        const value = changes['contactPoint'] as string | ContactPoint;
        const role = changes['role'] as string | undefined;
        if (typeof value !== 'string') {
          return [];
        }

        const selectedLabel = this.selectedContactPoint
          ? this.getSelectedContactPointLabel(this.selectedContactPoint)
          : '';
        if (selectedLabel !== value) {
          this.selectedContactPoint = null;
        }

        return this.filter(value, role);
      }),
    );
  }

  private getContactPointData(): void {
    this.isLoadingObs.emit(true);
    this.apiService.endpoints.ContactPoint.getAll
      .call()
      .then((contacPoint: Array<ContactPoint>) => {
        this.contactPointAll = this.getUniqueContactPoints(contacPoint);
        this.form.get('contactPoint')?.setValue(this.form.get('contactPoint')?.value ?? '', { emitEvent: true });
      })
      .catch(() =>
        this.snackbarService.openSnackbar(`Failed to fetch ContactPoint data.`, 'close', SnackbarType.ERROR, 3000, [
          'snackbar',
          'mat-toolbar',
          'snackbar-error',
        ]),
      )
      .finally(() => this.isLoadingObs.emit(false));
  }

  public handleAddContactPoint(): void {
    if (!this.selectedContactPoint) {
      return;
    }

    const selectedContactPoint = this.selectedContactPoint;

    const activeSoftwareApplication = this.entityExecutionService.getActiveSoftwareApplicationValue();
    if (activeSoftwareApplication == null) {
      return;
    }

    const existingContactPoints = [...(this.contactPoint ?? [])];
    const alreadySelected = existingContactPoints.some(
      (item: LinkedEntity) => item.instanceId === selectedContactPoint.instanceId,
    );
    if (alreadySelected) {
      this.snackbarService.openSnackbar(`Contact Point already selected.`, 'close', SnackbarType.WARNING, 3000, [
        'snackbar',
        'mat-toolbar',
        'snackbar-warning',
      ]);
      return;
    }

    const contactPointEntityDetail: LinkedEntity = {
      entityType: Entity.CONTACT_POINT,
      instanceId: selectedContactPoint.instanceId,
      uid: selectedContactPoint.uid,
      metaId: selectedContactPoint.metaId,
    };

    const updatedContactPoints = [...existingContactPoints, contactPointEntityDetail];
    activeSoftwareApplication.contactPoint = updatedContactPoints;
    this.entityExecutionService.setActiveSoftwareApplication(activeSoftwareApplication);

    this.contactPoint = updatedContactPoints;
    this.contactPointDetailsUpdated.emit(updatedContactPoints);
    this.addedContactPointDetail.emit(selectedContactPoint);
    this.selectedContactPoint = null;
    this.form.reset({ role: this.contactPointRoleOptions[0]?.id, contactPoint: '' });

    this.snackbarService.openSnackbar(`Please save.`, 'close', SnackbarType.WARNING, 3000, [
      'snackbar',
      'mat-toolbar',
      'snackbar-warning',
    ]);
  }

  private filter(name: string, selectedRole: string | undefined): ContactPoint[] {
    const filterValue = name.toLowerCase();
    return (this.contactPointAll ?? []).filter((option: ContactPoint) => {
      if (!this.roleMatchesFilter(option, selectedRole)) {
        return false;
      }

      const label = this.getContactPointOptionLabel(option).toLowerCase();
      if (!label) {
        return false;
      }

      return label.includes(filterValue);
    });
  }

  private roleMatchesFilter(option: ContactPoint, selectedRole: string | undefined): boolean {
    if (!selectedRole) {
      return true;
    }

    return this.normalizeRole(option.role) === this.normalizeRole(selectedRole);
  }

  private normalizeRole(value: string | undefined): string {
    return (value ?? '').replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
  }

  private getUniqueContactPoints(contactPoints: ContactPoint[]): ContactPoint[] {
    const uniqueMap = new Map<string, ContactPoint>();

    contactPoints.forEach((contactPoint: ContactPoint) => {
      const key = this.getContactPointIdentityKey(contactPoint);
      if (!uniqueMap.has(key)) {
        uniqueMap.set(key, contactPoint);
      }
    });

    return Array.from(uniqueMap.values());
  }

  private getContactPointIdentityKey(contactPoint: ContactPoint): string {
    return contactPoint.instanceId || '';
  }

  public ngOnInit(): void {
    this.contactPointRoleOptions = Object.entries(ContactPointRole).map(([id, name]) => ({
      id,
      name: String(name),
    }));
    this.initForm();
    this.initSubscriptions();
    this.trackFormChanges();
    this.getContactPointData();
  }

  public getContactPointOptionLabel(contactPoint: ContactPoint): string {
    if (!contactPoint) {
      return '';
    }
    const email = contactPoint.email?.[0]?.trim() ?? '';

    return email;
  }

  public getSelectedContactPointLabel(contactPoint: ContactPoint): string {
    const email = contactPoint.email?.[0]?.trim() ?? '';

    return email;
  }

  public get selectedRoleInFilter(): string {
    const selectedRoleId = this.form?.get('role')?.value as string | undefined;
    const selectedRole = this.contactPointRoleOptions.find((roleOption) => roleOption.id === selectedRoleId);

    return selectedRole?.name ?? 'Role';
  }

  public handleSelectContactPoint(contactPoint: ContactPoint): void {
    this.selectedContactPoint = contactPoint;
    this.form
      .get('contactPoint')
      ?.setValue(this.getSelectedContactPointLabel(this.selectedContactPoint), { emitEvent: false });
  }
}
