import { Injectable } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { BehaviorSubject } from 'rxjs';
import { EntityExecutionService } from 'src/services/calls/entity-execution.service';

@Injectable({
  providedIn: 'root',
})
export class ParametersFormService {
  constructor(private formBuilder: FormBuilder, private entityExecutionService: EntityExecutionService) {}

  private disableOperationSave: BehaviorSubject<boolean> = new BehaviorSubject(true);

  public disableOperationSaveObs = this.disableOperationSave.asObservable();

  private checkAllowedValues(parameter: any): string {
    if (parameter.paramValue) {
      return parameter.paramValue.length > 0 ? 'controlled' : 'any';
    } else {
      return 'any';
    }
  }

  /**
   * The function `checkBool` checks if a given value is truthy or 'false' and returns a boolean result.
   * @param {string | boolean | null} value - The `value` parameter in the `checkBool` function can be a
   * string, a boolean, or null.
   * @returns The function `checkBool` returns a boolean value. It returns `false` if the input `value`
   * is `null`, falsy (e.g., empty string, false, 0), or the string 'false'. Otherwise, it returns
   * `true`.
   */
  public checkBool(value: string | boolean | null): boolean {
    if (null == value || !value || value === 'false') {
      return false;
    }
    return true;
  }

  public generateOptionForm(parameter: any): FormGroup {
    return this.formBuilder.group({
      uid: [parameter.uid],
      metaId: [parameter.metaId],
      instanceId: [parameter.instanceId],
      label: [parameter.label, [Validators.required]],
      range: [{ value: parameter.range, disabled: true }],
      variable: [{ value: parameter.variable, disabled: true }],
      required: [this.checkBool(parameter.required)],
      readOnlyValue: [parameter.readOnlyValue === 'true'],
      defaultValue: [parameter.defaultValue],
      minValue: [parameter.minValue],
      maxValue: [parameter.maxValue],
      property: [parameter.property],
      allowedValues: [this.checkAllowedValues(parameter)],
      multipleValues: [this.checkBool(parameter.multipleValues)],
      paramValue: this.formBuilder.array(
        parameter.paramValue.map((value: any) => new FormControl(value, Validators.required)),
      ),
    });
  }

  public cacheParam(updatedMapping: any): void {
    const activeSupportedOperation = this.entityExecutionService.getActiveOperationValue();
    if (null != activeSupportedOperation) {
      const updatedMappingArray = activeSupportedOperation?.mapping?.map((item: any) =>
        item.variable === updatedMapping.variable ? updatedMapping : item,
      );
      activeSupportedOperation.mapping = updatedMappingArray as Array<any>;

      const nullsOrEmptyExist = (map: any) => map.label == null || map.label === '';
      this.disableOperationSave.next(activeSupportedOperation.mapping.some(nullsOrEmptyExist));

      activeSupportedOperation?.mapping.map((mappingObj: Record<string, unknown>) => {
        Object.keys(mappingObj).forEach((key) => {
          if (null == mappingObj[key]) {
            mappingObj[key] = undefined;
          }
        });
        return mappingObj;
      });
      this.entityExecutionService.setActiveOperation(activeSupportedOperation);
    }
  }
}
