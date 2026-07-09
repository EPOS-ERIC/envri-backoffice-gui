import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DialogData } from '../baseDialogService.abstract';
import { OperationParamsRange } from 'src/utility/enums/operationParamsRange.enum';
// import { Mapping } from 'src/apiAndObjects/objects/types/mapping.type';
import { FormBuilder, FormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { EntityExecutionService } from 'src/services/calls/entity-execution.service';
import { ApiService } from 'src/apiAndObjects/api/api.service';
import { LinkedEntity, Mapping } from 'generated/backofficeSchemas';

@Component({
  selector: 'app-dialog-add-new-parameter',
  templateUrl: './dialog-add-new-parameter.component.html',
  styleUrls: ['./dialog-add-new-parameter.component.scss'],
})
export class DialogAddNewParameterComponent implements OnInit {
  public ranges = Object.values(OperationParamsRange);
  public form!: UntypedFormGroup;
  public duplicateName = false;
  private activeMappingArr: Array<string> = [];
  private mapping: any = { range: '', variable: '', required: '', groups: undefined };

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: DialogData<string[] | undefined>,
    private readonly formBuilder: FormBuilder,
    private operationService: EntityExecutionService,
    private apiService: ApiService,
  ) {
    this.refreshMappingNames(this.operationService.getActiveMappingArrValue());
    this.operationService.mappingObs.subscribe((mapping: Array<any>) => {
      this.refreshMappingNames(mapping);
      if (this.form) {
        this.syncDuplicateName(this.form.get('variable')?.value ?? '');
      }
    });
  }

  public ngOnInit(): void {
    // assign group
    this.mapping.groups = this.data.dataIn;
    this.createForm();
  }

  private createForm() {
    this.form = this.formBuilder.group({
      variable: new FormControl(this.mapping.variable, [Validators.required]),
      range: new FormControl(this.mapping.range, Validators.required),
      required: new FormControl(false),
    });
    this.form.valueChanges.subscribe((changes) => {
      this.syncDuplicateName(changes.variable);

      this.mapping.variable = changes['variable'];
      this.mapping.range = changes['range'];
      this.mapping.required = changes['required'].toString();
    });

    this.syncDuplicateName(this.form.get('variable')?.value ?? '');
  }

  public handleCancel(): void {
    this.data.dataOut = null;
    this.data.close();
  }

  public handleAdd(): void {
    if (this.duplicateName) {
      return;
    }

    this.form.disable();
    const newParam: Mapping = {
      range: this.mapping.range,
      required: this.mapping.required,
      variable: this.mapping.variable,
      groups: this.mapping.groups,
    };
    this.apiService.endpoints.Mapping.create.call(newParam).then((data: LinkedEntity) => {
      this.data.dataOut = data;
      this.data.close();
    });
  }

  public checkForSameVariableName(value: string) {
    const normalizedValue = value.trim();
    return (this.duplicateName = this.activeMappingArr.some((item) => item === normalizedValue));
  }

  private refreshMappingNames(mapping: Array<any>): void {
    this.activeMappingArr = mapping
      .map((item) => item?.variable)
      .filter((variable): variable is string => typeof variable === 'string' && variable.trim().length > 0);
  }

  private syncDuplicateName(value: string): void {
    const isDuplicate = this.checkForSameVariableName(value);
    const variableControl = this.form.get('variable');
    if (!variableControl) {
      return;
    }

    const errors = { ...(variableControl.errors ?? {}) } as Record<string, unknown>;
    if (isDuplicate) {
      variableControl.setErrors({ ...errors, duplicateName: true });
      return;
    }

    if (variableControl.hasError('duplicateName')) {
      delete errors['duplicateName'];
      variableControl.setErrors(Object.keys(errors).length > 0 ? errors : null);
    }
  }
}
