import { Component, Input, Output, OnInit } from '@angular/core';
import { debounceTime, Subject } from 'rxjs';
import { ParametersFormService } from '../parameters-form.service';
import { UntypedFormGroup } from '@angular/forms';
import { Mapping } from 'generated/backofficeSchemas';

@Component({
  selector: 'app-option',
  templateUrl: './option.component.html',
  styleUrl: './option.component.scss',
})
export class OptionComponent implements OnInit {
  @Input() id: string = '';
  @Input() param!: Mapping;
  @Input() disabled = false;
  @Output() updatedParam = new Subject<Mapping>();

  constructor(private formService: ParametersFormService) {}

  public optionForm!: UntypedFormGroup;

  public disableAddNewValue = false;
  public readOnlyValue = false;

  public isRequired = false;

  public ngOnInit(): void {
    this.initForm();
    this.trackFormChanges();
    this.disabled ? this.optionForm.disable() : this.optionForm.enable();
  }

  private initForm(): void {
    this.optionForm = this.formService.generateOptionForm({ ...this.param });
    if (this.formService.checkBool(this.param.multipleValues as string)) {
      this.disableAddNewValue = true;
    }
    if (this.formService.checkBool(this.param.readOnlyValue as string)) {
      this.readOnlyValue = true;
    }
  }

  private trackFormChanges(): void {
    this.optionForm.valueChanges.pipe(debounceTime(500)).subscribe((changes) => {
      if (changes.multipleValues && this.formService.checkBool(changes.multipleValues)) {
        this.disableAddNewValue = true;
      } else {
        this.disableAddNewValue = false;
      }
      this.param = {
        ...changes,
        required: changes.required.toString(),
        readOnlyValue: changes.readOnlyValue ? changes.readOnlyValue.toString() : '',
        multipleValues: changes.multipleValues ? changes.multipleValues.toString() : '',
      };
      this.updatedParam.next(this.param);
    });
  }
}
