/* eslint-disable @typescript-eslint/no-explicit-any */
import { OnInit, Component } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, Validators, UntypedFormControl } from '@angular/forms';
import { debounceTime } from 'rxjs/operators';
import { DataProduct } from 'src/apiAndObjects/objects/entities/dataProduct.model';
import { EntityExecutionService } from 'src/services/calls/entity-execution.service';
import { HelpersService } from 'src/services/helpers.service';
import { Status } from 'src/utility/enums/status.enum';
import { AcrualPeriodicity } from 'src/utility/enums/vocabulary/accrualPeriodicity.enum';
import { DcmiType } from 'src/utility/enums/vocabulary/dcmiType.enum';
import { DataproductService } from '../../dataproduct.service';
import { DialogService } from 'src/components/dialogs/dialog.service';
import { DialogRevisionsComponent } from 'src/components/dialogs/dialog-revisions/dialog-revisions.component';
import { Entity } from 'src/utility/enums/entity.enum';
import { EntityEndpointValue } from 'src/utility/enums/entityEndpointValue.enum';

@Component({
  selector: 'app-general-information',
  templateUrl: './general-information.component.html',
  styleUrl: './general-information.component.scss',
})
export class GeneralInformationComponent implements OnInit {
  public dataProduct: DataProduct;

  public form!: FormGroup;

  public stateEnum = Status;

  public floatLabelControl = new UntypedFormControl('auto');

  public accrualPeriodicityOptions: Array<{ id: string; name: string }> = [];

  public typeOptions: Array<{ id: string; name: string }> = [];

  constructor(
    private readonly helpersService: HelpersService,
    private readonly entityExecutionService: EntityExecutionService,
    private readonly dataProductService: DataproductService,
    private readonly dialogService: DialogService,
  ) {
    this.dataProduct = this.entityExecutionService.getActiveDataProductValue() as DataProduct;
  }

  private initForm(): void {
    if (this.dataProduct) {
      this.form = new FormGroup({
        title: new FormControl(this.dataProduct?.title, [Validators.required]),
        description: new FormControl(this.dataProduct?.description, [Validators.required]),
        keywords: new FormControl(HelpersService.whiteSpaceReplace(this.dataProduct?.keywords)),
        versionInfo: new FormControl(this.dataProduct?.versionInfo),
        accrualPeriodicity: new FormControl(this.dataProduct?.accrualPeriodicity),
        type: new FormControl(this.dataProduct?.type),
        issued: new FormControl(this.dataProduct?.issued),
        created: new FormControl(this.dataProduct?.created),
        modified: new FormControl(this.dataProduct?.modified),
        qualityAssurance: new FormControl(this.dataProduct?.qualityAssurance, [
          (control: AbstractControl): { [key: string]: any } | null => {
            if (control.value === '') {
              return null;
            }
            if (this.helpersService.isValidHttpUrl(control.value)) {
              return null;
            } else {
              control.markAsTouched();
              return { 'error-class': control.value };
            }
          },
        ]),
      });
      if (this.dataProduct?.status === Status.PUBLISHED || this.dataProduct?.status === Status.ARCHIVED) {
        this.form.disable();
      }
    }
  }

  private trackFormChanges(): void {
    const updatingObject = this.entityExecutionService.getActiveDataProductValue() || {};
    this.form.valueChanges.pipe(debounceTime(500)).subscribe((changes) => {
      this.dataProductService.updateDataProductRecord(updatingObject, {
        title: this.helpersService.formatArrayVal(changes.title),
        description: this.helpersService.formatArrayVal(changes.description),
        keywords: changes.keywords,
        versionInfo: changes.versionInfo,
        accrualPeriodicity: changes.accrualPeriodicity,
        type: changes.type,
        issued: changes.issued,
        created: changes.created,
        modified: changes.modified,
        qualityAssurance: changes.qualityAssurance,
      });
    });
  }

  public ngOnInit(): void {
    this.initForm();
    this.trackFormChanges();
    this.accrualPeriodicityOptions = Object.entries(AcrualPeriodicity).map((e) => ({ name: e[1], id: e[0] }));
    this.typeOptions = Object.entries(DcmiType).map((e) => ({ name: e[1], id: e[0] }));
  }

  public triggerVersionDialog(): void {
    this.dialogService.openDialogForComponent(
      DialogRevisionsComponent,
      {
        metaId: this.dataProduct?.metaId,
        type: Entity.DATA_PRODUCT,
        instanceId: this.dataProduct?.instanceId,
      },
      '65vw',
      'auto',
      'revisions-dialog',
    );
  }

  public handleDeleteDataProduct(): void {
    this.dialogService.handleDelete(this.dataProduct?.instanceId as string, EntityEndpointValue.DATA_PRODUCT);
  }
}
