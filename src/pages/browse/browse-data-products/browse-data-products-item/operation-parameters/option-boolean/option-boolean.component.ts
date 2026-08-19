import { Component, Input } from '@angular/core';
import { Mapping } from 'generated/backofficeSchemas';
import { ParametersFormService } from '../parameters-form.service';

@Component({
  selector: 'app-option-boolean',
  templateUrl: './option-boolean.component.html',
  styleUrls: ['./option-boolean.component.scss'],
})
export class OptionBooleanComponent {
  @Input() param!: Mapping;
  @Input() disabled = false;

  constructor(private formService: ParametersFormService) {}

  public handleCacheParam(updatedMapping: Mapping): void {
    this.formService.cacheParam(updatedMapping);
  }
}
