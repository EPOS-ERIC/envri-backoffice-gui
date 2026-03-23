/* eslint-disable @typescript-eslint/no-explicit-any */
import { OnInit, Component } from '@angular/core';
import { FormControl, FormGroup, Validators, UntypedFormControl, UntypedFormBuilder, FormArray } from '@angular/forms';
import { debounceTime } from 'rxjs/operators';
import { EntityExecutionService } from 'src/services/calls/entity-execution.service';
import { HelpersService } from 'src/services/helpers.service';
import { Status } from 'src/utility/enums/status.enum';
import { DcmiType } from 'src/utility/enums/vocabulary/dcmiType.enum';
import { SoftwareSourceCodeService } from '../../softwareSourceCode.service';
import { DialogService } from 'src/components/dialogs/dialog.service';
import { DialogRevisionsComponent } from 'src/components/dialogs/dialog-revisions/dialog-revisions.component';
import { Entity } from 'src/utility/enums/entity.enum';
import { EntityEndpointValue } from 'src/utility/enums/entityEndpointValue.enum';
import { SoftwareSourceCode } from 'src/apiAndObjects/objects/entities/softwareSourceCode.model';
import { MatChipInputEvent } from '@angular/material/chips';
import { ApiService } from 'src/apiAndObjects/api/api.service';
import { LinkedEntity, Organization } from 'generated/backofficeSchemas';
import { SnackbarService, SnackbarType } from 'src/services/snackbar.service';

@Component({
  selector: 'app-general-information-sourceCode',
  templateUrl: './general-information.component.html',
  styleUrl: './general-information.component.scss',
})
export class GeneralInformationSourceCodeComponent implements OnInit {
  public softwareSourceCode: SoftwareSourceCode;

  public form!: FormGroup;

  public stateEnum = Status;

  public floatLabelControl = new UntypedFormControl('auto');

  public accrualPeriodicityOptions: Array<{ id: string; name: string }> = [];

  public typeOptions: Array<{ id: string; name: string }> = [];

  public organizations: Organization[] = [];

  public selectedOrganizations: Organization[] | null = null;

  public creatorLoading = true;

  constructor(
    private readonly helpersService: HelpersService,
    private readonly entityExecutionService: EntityExecutionService,
    private readonly softwareSourceCodeService: SoftwareSourceCodeService,
    private readonly dialogService: DialogService,
    private readonly formBuilder: UntypedFormBuilder,
    private readonly apiService: ApiService,
    private readonly snackbarService: SnackbarService,
  ) {
    this.softwareSourceCode = this.entityExecutionService.getActiveSoftwareSourceCodeValue() as SoftwareSourceCode;
  }

  private initForm(): void {
    if (this.softwareSourceCode) {
      this.form = new FormGroup({
        name: new FormControl(this.softwareSourceCode?.name, [Validators.required]),
        description: new FormControl(this.softwareSourceCode?.description, [Validators.required]),
        keywords: new FormControl(HelpersService.whiteSpaceReplace(this.softwareSourceCode?.keywords)),
        mainEntityofPage: new FormControl(this.softwareSourceCode?.mainEntityofPage),
        licenseURL: new FormControl(this.softwareSourceCode?.licenseURL),
        softwareVersion: new FormControl(this.softwareSourceCode?.softwareVersion),
        downloadURL: new FormControl(this.softwareSourceCode?.downloadURL),
        programmingLanguage: this.formBuilder.array(
          (this.softwareSourceCode?.programmingLanguage ?? []).map((lang) => this.formBuilder.control(lang)),
        ),
        softwareRequirements: new FormControl(this.softwareSourceCode?.softwareRequirements),
        runtimePlatform: new FormControl(this.softwareSourceCode?.runtimePlatform),
        creator: this.formBuilder.array(
          (this.softwareSourceCode?.creator ?? []).map((creator) => this.formBuilder.control(creator)),
        ),
      });
      if (this.softwareSourceCode?.status === Status.PUBLISHED || this.softwareSourceCode?.status === Status.ARCHIVED) {
        this.form.disable();
      }
    }
  }

  private trackFormChanges(): void {
    const updatingObject = this.entityExecutionService.getActiveSoftwareSourceCodeValue() || {};
    this.form.valueChanges.pipe(debounceTime(500)).subscribe((changes) => {
      this.softwareSourceCodeService.updateSoftwareSourceCodeRecord(updatingObject, {
        name: changes.name,
        description: changes.description,
        keywords: changes.keywords,
        mainEntityofPage: changes.mainEntityofPage,
        licenseURL: changes.licenseURL,
        softwareVersion: changes.softwareVersion,
        downloadURL: changes.downloadURL,
        programmingLanguage: changes.programmingLanguage,
        softwareRequirements: changes.softwareRequirements,
        runtimePlatform: changes.runtimePlatform,
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

  // manage "ProgrammingLanguage" field
  get programmingLanguageArray(): FormArray {
    return this.form.get('programmingLanguage') as FormArray;
  }
  public addLanguage(value: string) {
    const v = (value ?? '').trim();
    if (!v) return;
    // avoid duplicates
    const exists = this.programmingLanguageArray.value.some((x: string) => (x ?? '').toLowerCase() === v.toLowerCase());
    if (exists) return;
    this.programmingLanguageArray.push(this.formBuilder.control(v));
  }
  public removeLanguage(index: number) {
    this.programmingLanguageArray.removeAt(index);
  }
  public onChipTokenEnd(event: MatChipInputEvent) {
    const value = event.value ?? '';
    this.addLanguage(value);
    event.chipInput?.clear();
  }

  public ngOnInit(): void {
    this.creatorLoading = true;
    this.apiService.endpoints[Entity.ORGANIZATION].getAll
      .call()
      .then((organizations: LinkedEntity[]) => {
        this.organizations = organizations as Organization[];
        this.selectedOrganizations = this.organizations.filter((org: Organization) => {
          return this.softwareSourceCode?.creator?.some((value: LinkedEntity) => {
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
        metaId: this.softwareSourceCode?.metaId,
        type: Entity.SOFTWARE_SOURCE_CODE,
        instanceId: this.softwareSourceCode?.instanceId,
      },
      '65vw',
      'auto',
      'revisions-dialog',
    );
  }

  public handleDeleteSoftwareSourceCodeDelete(): void {
    this.dialogService.handleDelete(
      this.softwareSourceCode?.instanceId as string,
      EntityEndpointValue.SOFTWARE_SOURCE_CODE,
    );
  }

  public handleUpdateCreator(): void {
    const activeSoftwareSourceCode = this.entityExecutionService.getActiveSoftwareSourceCodeValue();
    if (activeSoftwareSourceCode == null) {
      return;
    }

    this.softwareSourceCodeService.updateSoftwareSourceCodeRecord(activeSoftwareSourceCode, {
      creator: this.getSelectedCreatorEntities(),
    });

    this.snackbarService.openSnackbar(`Please save.`, 'close', SnackbarType.WARNING, 3000, [
      'snackbar',
      'mat-toolbar',
      'snackbar-warning',
    ]);
  }
}
