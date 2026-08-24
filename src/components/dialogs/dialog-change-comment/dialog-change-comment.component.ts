import { Component, Inject, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DialogData } from '../baseDialogService.abstract';

@Component({
  selector: 'app-dialog-change-comment',
  templateUrl: './dialog-change-comment.component.html',
  styleUrls: ['./dialog-change-comment.component.scss'],
})
// This component is not in use anymore, however keeping it for possible future use
export class DialogChangeCommentComponent implements OnInit {
  public currentComment = '';
  public newChangeComment = '';
  constructor(private formBuilder: UntypedFormBuilder, @Inject(MAT_DIALOG_DATA) public data: DialogData<string>) {
    this.currentComment = this.data.dataIn;
  }

  public form!: UntypedFormGroup;

  public handleClose(): void {
    this.data.close();
    this.data.dataOut = null;
  }

  public handleSave(): void {
    this.data.dataOut = this.newChangeComment;
    this.data.close();
  }

  public ngOnInit(): void {
    this.form = this.formBuilder.group({
      changeComment: ['', Validators.required],
    });

    this.form.valueChanges.subscribe((changes) => {
      this.newChangeComment = changes['changeComment'];
    });
  }
}
