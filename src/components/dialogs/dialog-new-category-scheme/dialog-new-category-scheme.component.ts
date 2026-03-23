import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ApiService } from 'src/apiAndObjects/api/api.service';
import { CategoryScheme, LinkedEntity } from 'generated/backofficeSchemas';
import { DialogData } from '../baseDialogService.abstract';

interface TopConceptOption {
  linkedEntity: LinkedEntity;
  displayLabel: string;
}

@Component({
  selector: 'app-dialog-new-category-scheme',
  templateUrl: './dialog-new-category-scheme.component.html',
  styleUrl: './dialog-new-category-scheme.component.scss',
})
export class DialogNewCategorySchemeComponent implements OnInit {
  public form!: FormGroup;
  public availableTopConcepts: TopConceptOption[] = [];
  public isLoading = true;
  private maxOrderItemNumber = 0;
  public color: string = '';
  public isEditMode = false;

  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly apiService: ApiService,
    public dialogRef: MatDialogRef<DialogNewCategorySchemeComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData<unknown, any>,
  ) {}

  public ngOnInit(): void {
    this.isEditMode = !!(this.data.dataIn && (this.data.dataIn as any).uid);
    this.initForm();
    this.loadCategorySchemes();
  }

  private initForm(): void {
    const scheme = this.isEditMode ? (this.data.dataIn as any) : null;

    this.form = this.formBuilder.group({
      title: [scheme?.title || '', Validators.required],
      description: [scheme?.description || ''],
      code: [scheme?.code || ''],
      color: [scheme?.color || '', Validators.required],
      homepage: [scheme?.homepage || ''],
      logo: [scheme?.logo || '', Validators.required],
      topConcepts: [scheme?.topConcepts?.[0] || null, Validators.required],
    });

    if (scheme?.color) {
      this.color = scheme.color;
    }
  }
  onColorChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const value = input.value;

    // If input comes from color picker, it's always valid hex
    if (input.type === 'color') {
      this.color = value;
      this.form.get('color')?.setValue(value);
      return;
    }

    // Ensure the value starts with "#" and is a valid hex color
    if (value && !/^#[0-9A-Fa-f]{6}$/.test(value)) {
      // Optionally you can reset or show an error message here
      input.setCustomValidity('Please enter a valid hex color (e.g., #06a8e2)');
    } else {
      input.setCustomValidity('');
      this.color = value;
      // Sync with form control if valid
      this.form.get('color')?.setValue(value, { emitEvent: false });
    }
  }

  private loadCategorySchemes(): void {
    this.isLoading = true;
    this.apiService.endpoints.CategoryScheme.getAll
      .call()
      .then((schemes: CategoryScheme[]) => {
        this.extractTopConcepts(schemes);
        this.calculateMaxOrderItemNumber(schemes);
      })
      .catch((error) => {
        console.error('Error loading category schemes:', error);
      })
      .finally(() => {
        this.isLoading = false;
      });
  }

  private extractTopConcepts(schemes: CategoryScheme[]): void {
    const topConceptsMap = new Map<string, TopConceptOption>();

    schemes.forEach((scheme) => {
      if (scheme.topConcepts && Array.isArray(scheme.topConcepts)) {
        scheme.topConcepts.forEach((tc: LinkedEntity) => {
          if (tc.uid && !topConceptsMap.has(tc.uid)) {
            topConceptsMap.set(tc.uid, {
              linkedEntity: tc,
              displayLabel: tc.uid, // Just show the raw UID
            });
          }
        });
      }
    });

    this.availableTopConcepts = Array.from(topConceptsMap.values());
  }

  // TODO: implement file upload from computer
  /* public onLogoFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      const reader = new FileReader();
      
      reader.onload = (e) => {
        const base64String = e.target?.result as string;
        this.form.patchValue({ logo: base64String });
      };
      
      reader.readAsDataURL(file);
    }
  } */
  //to find orderitemnumber for the new category scheme
  private calculateMaxOrderItemNumber(schemes: CategoryScheme[]): void {
    this.maxOrderItemNumber = 0;

    schemes.forEach((scheme) => {
      if (scheme.orderitemnumber) {
        const orderNum = parseInt(scheme.orderitemnumber, 10);
        if (!isNaN(orderNum) && orderNum > this.maxOrderItemNumber) {
          this.maxOrderItemNumber = orderNum;
        }
      }
    });
  }

  public onSubmit(): void {
    if (this.form.valid) {
      const formValue = this.form.value;
      const topConcepts = formValue.topConcepts ? [formValue.topConcepts] : [];

      if (this.isEditMode) {
        const existingScheme = this.data.dataIn as any;
        this.data.dataOut = {
          title: formValue.title,
          description: formValue.description,
          code: formValue.code,
          color: formValue.color,
          homepage: formValue.homepage,
          logo: formValue.logo,
          topConcepts,
          orderitemnumber: existingScheme.orderitemnumber,
          uid: existingScheme.uid,
          instanceId: existingScheme.instanceId,
          status: 'PUBLISHED',
        };
      } else {
        const nextOrderItemNumber = (this.maxOrderItemNumber + 1).toString();
        this.data.dataOut = {
          title: formValue.title,
          description: formValue.description,
          code: formValue.code,
          color: formValue.color,
          homepage: formValue.homepage,
          logo: formValue.logo,
          topConcepts,
          orderitemnumber: nextOrderItemNumber,
          uid: `category:${formValue.title}`,
        };
      }
      this.dialogRef.close();
    } else {
      console.error('Form is invalid!');
    }
  }

  public onCancel(): void {
    this.dialogRef.close();
  }
}
