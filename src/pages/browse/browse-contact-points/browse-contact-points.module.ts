import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { AngularMaterialModule } from 'src/app/angular-material.module';
import { BrowseContactPointsComponent } from './browse-contact-points.component';
import { ContactPointDialogComponent } from './contact-point-dialog/contact-point-dialog.component';

@NgModule({
  declarations: [BrowseContactPointsComponent, ContactPointDialogComponent],
  imports: [CommonModule, AngularMaterialModule],
  exports: [BrowseContactPointsComponent],
})
export class BrowseContactPointsModule {}
