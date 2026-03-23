import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Group } from 'generated/backofficeSchemas';
import { DialogData } from '../baseDialogService.abstract';

interface DialogDataGroup {
  groups: Group[];
}

@Component({
  selector: 'app-dialog-select-group',
  templateUrl: './dialog-select-group.component.html',
  styleUrl: './dialog-select-group.component.scss',
})
export class DialogSelectGroupComponent implements OnInit {
  constructor(@Inject(MAT_DIALOG_DATA) public data: DialogData<DialogDataGroup>) {}

  public groups: Group[] = [];

  public selectedGroupId: string = '';

  public ngOnInit(): void {
    const filtered = this.data.dataIn.groups.filter((group: Group) => group.id !== '');
    if (filtered.length === 0) {
      this.groups = [
        {
          id: 'tsunami',
          name: 'Tsunami',
        },
        {
          id: 'volcanology',
          name: 'Volcanology',
        },
        {
          id: 'seismology',
          name: 'Seismology',
        },
      ];
    } else {
      this.groups = this.data.dataIn.groups;
    }
    this.selectedGroupId = this.groups[0].id as string;
  }

  public handleCancel(): void {
    this.data.dataOut = 'cancel';
    this.data.close();
  }

  public handleDelete(): void {
    this.data.dataOut = 'delete';
    this.data.close();
  }
}
