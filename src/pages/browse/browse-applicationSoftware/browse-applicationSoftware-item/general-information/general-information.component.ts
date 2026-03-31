/* eslint-disable @typescript-eslint/no-explicit-any */
import { OnInit, Component } from '@angular/core';
import { FormControl, FormGroup, Validators, UntypedFormControl, FormBuilder, FormArray } from '@angular/forms';
import { debounceTime } from 'rxjs/operators';
/* import { DataProduct } from 'src/apiAndObjects/objects/entities/dataProduct.model'; */
import { EntityExecutionService } from 'src/services/calls/entity-execution.service';
import { HelpersService } from 'src/services/helpers.service';
import { Status } from 'src/utility/enums/status.enum';
/* import { AcrualPeriodicity } from 'src/utility/enums/vocabulary/accrualPeriodicity.enum'; */
import { DcmiType } from 'src/utility/enums/vocabulary/dcmiType.enum';
import { SoftwareApplicationService } from '../../softwareApplication.service';
import { DialogService } from 'src/components/dialogs/dialog.service';
import { DialogRevisionsComponent } from 'src/components/dialogs/dialog-revisions/dialog-revisions.component';
import { Entity } from 'src/utility/enums/entity.enum';
import { EntityEndpointValue } from 'src/utility/enums/entityEndpointValue.enum';
import { SoftwareApplication } from 'src/apiAndObjects/objects/entities/softwareApplication.model';
import { MatChipInputEvent } from '@angular/material/chips';
import { ApiService } from 'src/apiAndObjects/api/api.service';
import { Identifier, LinkedEntity, Organization } from 'generated/backofficeSchemas';
import { SnackbarService, SnackbarType } from 'src/services/snackbar.service';
import { LoadingService } from 'src/services/loading.service';

@Component({
  selector: 'app-general-information-appSoft',
  templateUrl: './general-information.component.html',
  styleUrl: './general-information.component.scss',
})
export class GeneralInformationAppSoftComponent implements OnInit {
  public softwareApplication: SoftwareApplication;

  public form!: FormGroup;

  public stateEnum = Status;

  public floatLabelControl = new UntypedFormControl('auto');

  public accrualPeriodicityOptions: Array<{ id: string; name: string }> = [];

  public typeOptions: Array<{ id: string; name: string }> = [];

  //
  public organizations: Organization[] = [];

  public selectedOrganizations: Organization[] | null = null;

  public creatorLoading = true;

  constructor(
    private readonly helpersService: HelpersService,
    private readonly entityExecutionService: EntityExecutionService,
    private readonly softwareApplicationService: SoftwareApplicationService,
    private readonly dialogService: DialogService,
    private readonly formBuilder: FormBuilder,
    private readonly apiService: ApiService,
    private readonly snackbarService: SnackbarService,
    private readonly loadingService: LoadingService,
  ) {
    this.softwareApplication = this.entityExecutionService.getActiveSoftwareApplicationValue() as SoftwareApplication;
  }

  private initForm(): void {
    if (this.softwareApplication) {
      this.form = new FormGroup({
        name: new FormControl(this.softwareApplication?.name, [Validators.required]),
        description: new FormControl(this.softwareApplication?.description, [Validators.required]),
        keywords: new FormControl(HelpersService.whiteSpaceReplace(this.softwareApplication?.keywords)),
        mainEntityOfPage: new FormControl(this.softwareApplication?.mainEntityOfPage), // TODO: PAY ATTENTION: this is correctly camelCase, while SSC has been miseplled in Backend as "mainEntityofPage" !!!!
        licenseURL: new FormControl(this.softwareApplication?.licenseURL),
        softwareVersion: new FormControl(this.softwareApplication?.softwareVersion),
        downloadURL: new FormControl(this.softwareApplication?.downloadURL),
        operatingSystem: this.formBuilder.array(
          (this.softwareApplication?.operatingSystem ?? []).map((os) => this.formBuilder.control(os)),
        ),
        requirements: new FormControl(this.softwareApplication?.requirements),
        creator: this.formBuilder.array(
          (this.softwareApplication?.creator ?? []).map((creator) => this.formBuilder.control(creator)),
        ),
      });
      if (
        this.softwareApplication?.status === Status.PUBLISHED ||
        this.softwareApplication?.status === Status.ARCHIVED
      ) {
        this.form.disable();
      }
    }
  }

  private trackFormChanges(): void {
    const updatingObject = this.entityExecutionService.getActiveSoftwareApplicationValue() || {};
    this.form.valueChanges.pipe(debounceTime(500)).subscribe((changes) => {
      this.softwareApplicationService.updateSoftwareApplicationRecord(updatingObject, {
        name: changes.name,
        description: changes.description,
        keywords: changes.keywords,
        mainEntityOfPage: changes.mainEntityOfPage,
        licenseURL: changes.licenseURL,
        softwareVersion: changes.softwareVersion,
        downloadURL: changes.downloadURL,
        operatingSystem: changes.operatingSystem,
        requirements: changes.requirements,
        creator: this.getSelectedCreatorEntities(),
      });
    });
  }

  private getSelectedCreatorEntities(): LinkedEntity[] {
    if (!this.selectedOrganizations || this.selectedOrganizations.length === 0) {
      return [];
    }

    return this.selectedOrganizations.map((org: Organization) => ({
      entityType: 'ORGANIZATION',
      instanceId: org.instanceId,
      uid: org.uid,
      metaId: org.metaId,
    }));
  }

  public ngOnInit(): void {
    // retrieve Organizations to then populate Creator field options
    this.creatorLoading = true;
    this.apiService.endpoints[Entity.ORGANIZATION].getAll
      .call()
      .then((organizations: LinkedEntity[]) => {
        this.organizations = organizations as Organization[];
        this.selectedOrganizations = this.organizations.filter((org: Organization) => {
          return this.softwareApplication?.creator?.some((value: LinkedEntity) => {
            return org.instanceId === value.instanceId;
          });
        });
      })
      .catch(() => {
        this.organizations = [];
        this.selectedOrganizations = [];
      })
      .finally(() => {
        this.creatorLoading = false;
      });
    this.initForm();
    this.trackFormChanges();
    this.typeOptions = Object.entries(DcmiType).map((e) => ({ name: e[1], id: e[0] }));
  }

  public compareWithFn(optionOne: any, optionTwo: any): boolean {
    return !!optionOne && !!optionTwo && optionOne.metaId === optionTwo.metaId;
  }

  public triggerVersionDialog(): void {
    this.dialogService.openDialogForComponent(
      DialogRevisionsComponent,
      {
        metaId: this.softwareApplication?.metaId,
        type: Entity.SOFTWARE_APPLICATION,
        instanceId: this.softwareApplication?.instanceId,
      },
      '65vw',
      'auto',
      'revisions-dialog',
    );
  }

  public async handleDeleteSoftwareApplication(): Promise<void> {
    this.loadingService.setShowSpinner(true);

    const entitiesToDelete = new Map<string, EntityEndpointValue>();
    // set the softwareSourceCode to be deleted
    entitiesToDelete.set(this.softwareApplication?.instanceId as string, EntityEndpointValue.APPLICATION_SOFTWARE);
    
    const identifiers = this.softwareApplication?.identifier || [];
    const identifiersProm: Promise<unknown>[] = [];
    identifiers.forEach((identifier)=>{
      identifiersProm.push(
        this.apiService.endpoints.Identifier.get
        .call({
          metaId: identifier.metaId as string,
          instanceId: identifier.instanceId as string,
        })
        .then((identResp: Identifier[])=>{
          const filteredIdentifiers = identResp.filter((id) => id.status?.toUpperCase() === 'DRAFT');
          // set Identifier to be deleted
          filteredIdentifiers.forEach((identifier) => {
            entitiesToDelete.set(identifier.instanceId as string, EntityEndpointValue.IDENTIFIER);
          });
        })
      );
    })

    await Promise.allSettled(identifiersProm);
    this.loadingService.setShowSpinner(false);
    this.dialogService.handleDelete(entitiesToDelete);
  }

  public handleUpdateCreator(): void {
    const activeSoftwareApplication = this.entityExecutionService.getActiveSoftwareApplicationValue();
    if (activeSoftwareApplication == null) {
      return;
    }

    this.softwareApplicationService.updateSoftwareApplicationRecord(activeSoftwareApplication, {
      creator: this.getSelectedCreatorEntities(),
    });

    this.snackbarService.openSnackbar(`Please save.`, 'close', SnackbarType.WARNING, 3000, [
      'snackbar',
      'mat-toolbar',
      'snackbar-warning',
    ]);
  }

  // Managing of 'Operating System' input field
  get operatingSystemArray(): FormArray {
    return this.form.get('operatingSystem') as FormArray; // to keep in sync with the name of the field, ('operatingSystem')!
  }
  public addOs(value: string) {
    const v = (value ?? '').trim();
    if (!v) return;
    // avoid duplicates
    const exists = this.operatingSystemArray.value.some((x: string) => (x ?? '').toLowerCase() === v.toLowerCase());
    if (exists) return;
    this.operatingSystemArray.push(this.formBuilder.control(v));
  }
  public removeOs(index: number) {
    this.operatingSystemArray.removeAt(index);
  }
  public onChipTokenEnd(event: MatChipInputEvent) {
    const value = event.value ?? '';
    this.addOs(value);
    event.chipInput?.clear();
  }
}
