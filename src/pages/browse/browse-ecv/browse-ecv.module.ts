import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { AngularMaterialModule } from 'src/app/angular-material.module';
import { BrowseECVComponent } from './browse-ecv.component';

@NgModule({
  declarations: [BrowseECVComponent],
  imports: [CommonModule, AngularMaterialModule],
  exports: [BrowseECVComponent],
})
export class BrowseECVModule {}
