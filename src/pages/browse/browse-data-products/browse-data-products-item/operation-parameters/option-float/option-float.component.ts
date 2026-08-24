import { Component, Input } from '@angular/core';
import { FormArray, FormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { CoordinateType } from 'src/utility/enums/coordinateType.enum';

@Component({
  selector: 'app-option-float',
  templateUrl: './option-float.component.html',
  styleUrls: ['./option-float.component.scss'],
})
export class OptionFloatComponent {
  @Input() form!: UntypedFormGroup;
  @Input() disableAddNewValue!: boolean;


  // the four coordinates and empty option to be displayed in the dropdown
  public coordinateSemanticTagsOptions = [ '', ...Object.values(CoordinateType)];

  public handleAddNewValue(): void {
    const values = this.form.get('paramValue') as FormArray;
    values.push(new FormControl('', Validators.required));
  }

  public removeItem(index: number) {
    const value = this.form.get('paramValue') as FormArray;
    value.removeAt(index);
  }

  public handleValueChange(index: number): void {
    const values = this.form.get('paramValue') as FormArray;
    this.form.get('defaultValue')?.setValue(values.at(index).value);
  }

  public isChecked(index: number): boolean {
    const defaultValue = this.form.get('defaultValue')?.value;
    const values = this.form.get('paramValue') as FormArray;
    if (null != defaultValue) {
      return defaultValue === values.at(index).value;
    }
    return false;
  }

  public getControls(field: string) {
    return (this.form.get(field) as FormArray).controls;
  }

}
