import { AfterViewInit, Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormArray, FormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { ActiveToggle } from '../toggle.interface';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { Subscription } from 'rxjs';

type ControlledValueRow = {
  index: number;
  control: FormControl;
};

@Component({
  selector: 'app-option-integer',
  templateUrl: './option-integer.component.html',
  styleUrls: ['./option-integer.component.scss'],
})
export class OptionIntegerComponent implements OnInit, AfterViewInit, OnDestroy {
  @Input() form!: UntypedFormGroup;
  @Input() disableAddNewValue!: boolean;
  @Input() disabled!: boolean;

  public hideAddNewValue = false;
  public activeToggles: ActiveToggle[] = [];

  public displayedColumns: string[] = ['value', 'default', 'actions'];

  public dataSource = new MatTableDataSource<ControlledValueRow>([]);

  private selectedDefaultControl: FormControl | null = null;

  private selectedDefaultSubscription: Subscription | null = null;

  private filterSubscriptions = new Map<FormControl, Subscription>();

  public filterText = '';

  private editingControl: FormControl | null = null;

  @ViewChild(MatPaginator) public paginator!: MatPaginator;

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

    const matchedControl =
      (this.getParamValues().controls as FormControl[]).find((control: FormControl) => control.value === defaultValue) ?? null;
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

  public handleAddNewValue(): void {
    const values = this.getParamValues();
    values.push(new FormControl('', Validators.required));
    this.refreshDataSource();
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

  public getControls(field: string) {
    return (this.form.get(field) as FormArray).controls;
  }

  public trackByRow(_: number, row: ControlledValueRow): FormControl {
    return row.control;
  }

  // public disableSelect(index: number): boolean {
  //   // const canSelectMultiple = this.form.get('multipleValues')?.value === true;
  //   // const selectedAsDefaults = this.getControls('value').filter((item) => item.value.asDefault === true);

  //   // if (this.clickedIndex === index) {
  //   return false;
  //   // }
  //   // return !canSelectMultiple || selectedAsDefaults.length > 0;
  // }

  // public handleDefaultToggleChange(event: MatSlideToggleChange, index: number): void {
  //   const clickedIndex = Number(event.source._switchElement.nativeElement.id);
  //   if (event.checked === true) {
  //     this.clickedIndex = clickedIndex;
  //   }

  //   this.activeToggles = [];
  //   this.activeToggles.push({
  //     id: index,
  //     active: event.checked,
  //   });
  // }
}
