import { ChangeDetectionStrategy, Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AddUserToGroupBean } from 'generated/backofficeSchemas';
import { DialogData } from '../baseDialogService.abstract';

@Component({
  selector: 'app-dialog-user-status',
  templateUrl: './dialog-user-status.component.html',
  styleUrl: './dialog-user-status.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DialogUserStatusComponent implements OnInit {
  constructor(@Inject(MAT_DIALOG_DATA) public data: DialogData<string, string | undefined>) {}

  public currentStatus: AddUserToGroupBean['statusType'] = '';

  public userStatuses: string[] = ['DEFAULT', 'PENDING', 'ACCEPTED'];

  public setNewUserStatus(currentStatus: string | undefined): void {
    this.data.dataOut = currentStatus;
    this.data.close();
  }

  public cancel(): void {
    this.data.dataOut = undefined;
    this.data.close();
  }

  public ngOnInit(): void {
    this.currentStatus = this.data.dataIn;
  }
}
