import { Component, OnInit } from '@angular/core';
// import { initEmptyContactObj } from 'src/helpers/contact';

@Component({
  selector: 'app-dialog-add-contact',
  templateUrl: './dialog-add-contact.component.html',
  styleUrls: ['./dialog-add-contact.component.scss'],
})
export class DialogAddContactComponent implements OnInit {
  public data = [];
  // public formFields?: ContactPoint = initEmptyContactObj() as ContactPoint;
  public types = [
    {
      label: 'Contact',
      value: 'contact',
    },
  ];

  ngOnInit(): void {
    if (this.data && this.data.length > 0) {
      // this.formFields = this.data.shift();
    }
  }
}
