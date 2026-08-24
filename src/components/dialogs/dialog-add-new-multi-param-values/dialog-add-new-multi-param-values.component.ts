import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DialogData } from '../baseDialogService.abstract';

@Component({
  selector: 'app-dialog-add-new-multi-param-values',
  templateUrl: './dialog-add-new-multi-param-values.component.html',
  styleUrls: ['./dialog-add-new-multi-param-values.component.scss'],
})
export class DialogAddNewMultiParamValuesComponent {
  public incomingValues: Array<string> = []; 
  public alreadyExistingValues: Array<string> = [];
  public introducedDuplicateValues: Array<string> = [];
  
  public textareaContent = '';

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: DialogData<any>,
  ) {
    this.incomingValues = this.data.dataIn.currentValues;
  }

  public handleCancel(): void {
    this.data.dataOut = null;
    this.data.close();
  }

  public handleAdd(): void {
    const cleanValues: Array<string> = this.textareaContent
      .split(',')
      .map((value: string) => value.trim())
      .filter((value: string) => value.length > 0);

    this.alreadyExistingValues = this.checkAlreadyExisting(cleanValues);
    this.introducedDuplicateValues = this.checkIntroducedDuplicates(cleanValues);

    if (this.alreadyExistingValues.length > 0 || this.introducedDuplicateValues.length > 0) {
      return;
    }

    // send out Array of values and close the dialog
    this.data.dataOut = cleanValues;
    this.data.close();
  }

  public onTextareaContentChange(): void {
    if (this.textareaContent.trim().length > 0) {
      return;
    }
    // if textarea emptied, clean arryas of warning messages
    this.alreadyExistingValues = [];
    this.introducedDuplicateValues = [];
  }

  public copyTextareaContent(): void {
    if (this.textareaContent.length === 0 || navigator.clipboard?.writeText === undefined) {
      return;
    }

    const content = this.textareaContent;
    void navigator.clipboard.writeText(content).catch((error: unknown) => {
      console.warn('Unable to copy textarea content to clipboard', error);
    });
  }

  private checkAlreadyExisting(newValues: Array<string>): Array<string> {
    return Array.from(new Set(newValues.filter((newV: string) => this.incomingValues.includes(newV))));
  }

  private checkIntroducedDuplicates(newValues: Array<string>): Array<string> {
    const duplicates = new Set<string>();
    const seen = new Set<string>();

    newValues.forEach((newV: string) => {
      if (seen.has(newV)) {
        duplicates.add(newV);
        return;
      }

      seen.add(newV);
    });

    return Array.from(duplicates);
  }

}
