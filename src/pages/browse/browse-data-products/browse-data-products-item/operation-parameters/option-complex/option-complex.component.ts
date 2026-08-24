import { AfterViewInit, Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormArray, FormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { ActiveToggle } from '../toggle.interface';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { Subscription } from 'rxjs';
import { DialogService } from 'src/components/dialogs/dialog.service';

import { EncodingFormatSemanticTag } from 'src/utility/enums/encodingFormatSemanticTag.enum';

type ControlledValueRow = {
  index: number;
  control: FormControl;
};

@Component({
  selector: 'app-option-complex',
  templateUrl: './option-complex.component.html',
  styleUrl: './option-complex.component.scss',
})
export class OptionComplexComponent implements OnInit, AfterViewInit, OnDestroy {
  @Input() id: string = '';

  @Input() form!: UntypedFormGroup;

  @Input() disableAddNewValue!: boolean;

  private readonly clickedIndex!: number;

  public encodingFormatSemanticTag = Object.values(EncodingFormatSemanticTag);

  public activeToggles: ActiveToggle[] = [];

  public displayedColumns: string[] = ['value', 'default', 'actions'];

  public dataSource = new MatTableDataSource<ControlledValueRow>([]);

  public multipleValuesAddList = [];

  private selectedDefaultControl: FormControl | null = null;

  private selectedDefaultSubscription: Subscription | null = null;

  private filterSubscriptions = new Map<FormControl, Subscription>();

  public filterText = '';

  private editingControl: FormControl | null = null;

  @ViewChild(MatPaginator) public paginator!: MatPaginator;

  constructor(private dialogService: DialogService) {
    this.dialogService = dialogService;
  }

  public ngOnInit(): void {
    this.dataSource.filterPredicate = (row: ControlledValueRow, filter: string) => {
      if (this.editingControl === row.control) {
        return true;
      }

      const value = String(row.control.value ?? '').trim().toLowerCase();
      return value.includes(filter);
    };
    this.refreshDataSource();
    this.syncSelectedDefaultFromFormValue();
  }

  public ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
  }

  public ngOnDestroy(): void {
    this.selectedDefaultSubscription?.unsubscribe();
    this.filterSubscriptions.forEach((subscription) => subscription.unsubscribe());
    this.filterSubscriptions.clear();
  }

  private getParamValues(): FormArray {
    return this.form.get('paramValue') as FormArray;
  }

  private refreshDataSource(): void {
    if (!this.form) {
      return;
    }

    const controls = this.getParamValues().controls as FormControl[];
    controls.forEach((control: FormControl) => this.bindFilterRefresh(control));
    this.dataSource.data = controls.map((control: FormControl, index: number) => ({ index, control }));
    this.applyFilter();
  }

  private bindFilterRefresh(control: FormControl): void {
    if (this.filterSubscriptions.has(control)) {
      return;
    }

    this.filterSubscriptions.set(
      control,
      control.valueChanges.subscribe(() => {
        this.applyFilter();
      }),
    );
  }

  private unbindFilterRefresh(control: FormControl): void {
    this.filterSubscriptions.get(control)?.unsubscribe();
    this.filterSubscriptions.delete(control);
  }

  private applyFilter(): void {
    this.dataSource.filter = this.filterText.trim().toLowerCase();
  }

  public startEditing(control: FormControl): void {
    this.editingControl = control;
    this.applyFilter();
  }

  public stopEditing(control: FormControl): void {
    if (this.editingControl === control) {
      this.editingControl = null;
    }
    this.applyFilter();
  }

  public handleFilterChange(event: Event): void {
    this.filterText = (event.target as HTMLInputElement).value ?? '';
    this.applyFilter();
  }

  public clearFilter(): void {
    this.filterText = '';
    this.applyFilter();
  }

  private syncSelectedDefaultFromFormValue(): void {
    const defaultValue = this.form.get('defaultValue')?.value;
    if (defaultValue == null) {
      return;
    }

    const matchedControl = (this.getParamValues().controls as FormControl[]).find((control: FormControl) => control.value === defaultValue) ?? null;
    if (matchedControl) {
      this.setSelectedDefaultControl(matchedControl, false);
    }
  }

  private clearSelectedDefaultControl(): void {
    this.selectedDefaultSubscription?.unsubscribe();
    this.selectedDefaultSubscription = null;
    this.selectedDefaultControl = null;
  }

  private setSelectedDefaultControl(control: FormControl | null, updateValue = true): void {
    if (this.selectedDefaultControl === control) {
      if (updateValue && control != null) {
        this.form.get('defaultValue')?.setValue(control.value);
      }
      return;
    }

    this.clearSelectedDefaultControl();
    this.selectedDefaultControl = control;

    if (control == null) {
      if (updateValue) {
        this.form.get('defaultValue')?.setValue(null);
      }
      return;
    }

    if (updateValue) {
      this.form.get('defaultValue')?.setValue(control.value);
    }

    this.selectedDefaultSubscription = control.valueChanges.subscribe((value: string) => {
      if (this.selectedDefaultControl === control) {
        this.form.get('defaultValue')?.setValue(value);
      }
    });
  }

  public getControls(field: string) {
    return (this.form.get(field) as FormArray).controls;
  }



  public handleAddNewValue(): void {
    const values = this.getParamValues();
    values.push(new FormControl('', Validators.required));
    this.refreshDataSource();
  }

  public handleMultipleAdd(): void {
    // Array of current FormControls
    const values = this.getParamValues();
    // Array of current string values
    const currentValues: Array<string> = values.value;
    
    this.dialogService.openAddNewMultiParamValuesDialog(currentValues).then((dialogData) => {
      const multiValues = dialogData.dataOut as string[];
      if (multiValues && multiValues.length > 0) {
        multiValues.forEach(value => {
          values.push(new FormControl(value, Validators.required));
        });
        //refresh data
        this.refreshDataSource();
      }
    });
  }

  public removeItem(index: number) {
    const value = this.getParamValues();
    const controlToRemove = value.at(index) as FormControl;
    if (this.selectedDefaultControl === controlToRemove) {
      this.clearSelectedDefaultControl();
      this.form.get('defaultValue')?.setValue(null);
    }

    if (this.editingControl === controlToRemove) {
      this.editingControl = null;
    }

    this.unbindFilterRefresh(controlToRemove);

    value.removeAt(index);
    this.refreshDataSource();
  }

  public handleValueChange(control: FormControl, checked: boolean): void {
    if (checked) {
      this.setSelectedDefaultControl(control);
      return;
    }

    if (this.selectedDefaultControl === control) {
      this.clearSelectedDefaultControl();
      this.form.get('defaultValue')?.setValue(null);
    }
  }

  public isChecked(control: FormControl): boolean {
    return this.selectedDefaultControl === control;
  }

  public trackByRow(_: number, row: ControlledValueRow): FormControl {
    return row.control;
  }

  // public disableSelect(index: number): boolean {
  //   const canSelectMultiple = this.form.get('multipleValues')?.value === true;

  //   // const selectedAsDefaults = this.getControls('items').filter((item) => item.value.asDefault === true);
  //   // TODO: 'selectedAsDefaults' is not defined.
  //   const selectedAsDefaults = [];
  //   if (this.clickedIndex === index) {
  //     return false;
  //   }
  //   return !canSelectMultiple || selectedAsDefaults.length > 0;
  // }
}
