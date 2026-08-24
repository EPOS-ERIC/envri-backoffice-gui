import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatChipInputEvent } from '@angular/material/chips';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ContactPoint, Group } from 'generated/backofficeSchemas';
import { DialogData } from 'src/components/dialogs/baseDialogService.abstract';
import { ContactPointRole } from 'src/utility/enums/contactPointRole.enum';
import { Status } from 'src/utility/enums/status.enum';

export interface ContactPointDialogData {
  contactPoint?: ContactPoint;
  groups: Group[];
}

@Component({
  selector: 'app-contact-point-dialog',
  templateUrl: './contact-point-dialog.component.html',
  styleUrls: ['./contact-point-dialog.component.scss'],
})
export class ContactPointDialogComponent implements OnInit {
  public readonly separatorKeysCodes = [ENTER, COMMA];
  public readonly roleOptions = Object.entries(ContactPointRole).map(([id, name]) => ({ id, name }));
  public form!: FormGroup;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: DialogData<ContactPointDialogData, ContactPoint | undefined>,
    private readonly formBuilder: FormBuilder,
  ) {}

  public ngOnInit(): void {
    this.form = this.formBuilder.group({
      role: [this.data.dataIn.contactPoint?.role || '', Validators.required],
      email: [this.uniqueValues(this.data.dataIn.contactPoint?.email)],
      telephone: [this.uniqueValues(this.data.dataIn.contactPoint?.telephone)],
      language: [this.uniqueValues(this.data.dataIn.contactPoint?.language)],
      groups: [this.data.dataIn.contactPoint?.groups || [], Validators.required],
    });
  }

  public get isEditMode(): boolean {
    return Boolean(this.data.dataIn.contactPoint);
  }

  public get emails(): string[] {
    return this.form.controls['email'].value as string[];
  }

  public get telephones(): string[] {
    return this.form.controls['telephone'].value as string[];
  }

  public get languages(): string[] {
    return this.form.controls['language'].value as string[];
  }

  public get hasContactMethod(): boolean {
    return this.emails.length > 0 || this.telephones.length > 0;
  }

  public addValue(event: MatChipInputEvent, controlName: 'email' | 'telephone' | 'language'): void {
    const value = event.value.trim();
    if (value) {
      const values = this.form.controls[controlName].value as string[];
      if (!values.includes(value)) {
        this.form.controls[controlName].setValue([...values, value]);
      }
    }
    event.chipInput.clear();
  }

  public removeValue(value: string, controlName: 'email' | 'telephone' | 'language'): void {
    const values = this.form.controls[controlName].value as string[];
    this.form.controls[controlName].setValue(values.filter((item) => item !== value));
  }

  public handleCancel(): void {
    this.data.dataOut = undefined;
    this.data.close();
  }

  public handleSave(): void {
    if (this.form.invalid || !this.hasContactMethod) {
      this.form.markAllAsTouched();
      return;
    }

    const formValue = this.form.getRawValue();

    this.data.dataOut = {
      ...(this.data.dataIn.contactPoint || {}),
      role: formValue.role as string,
      email: formValue.email as string[],
      telephone: formValue.telephone as string[],
      language: formValue.language as string[],
      groups: formValue.groups as string[],
      status: this.isEditMode ? this.data.dataIn.contactPoint?.status : Status.PUBLISHED,
    };
    this.data.close();
  }

  private uniqueValues(values: string[] | undefined): string[] {
    return Array.from(new Set((values || []).map((value) => value.trim()).filter(Boolean)));
  }
}
