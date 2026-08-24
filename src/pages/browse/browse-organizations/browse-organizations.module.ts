import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { AngularMaterialModule } from 'src/app/angular-material.module';
import { BrowseOrganizationsComponent } from './browse-organizations.component';
import { OrganizationDialogComponent } from './organization-dialog/organization-dialog.component';

@NgModule({
  declarations: [BrowseOrganizationsComponent, OrganizationDialogComponent],
  imports: [CommonModule, AngularMaterialModule],
  exports: [BrowseOrganizationsComponent],
})
export class BrowseOrganizationsModule {}
