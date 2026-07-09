import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BrowseCategorySchemesComponent } from './browse-category-schemes.component';
import { AngularMaterialModule } from 'src/app/angular-material.module';
import { NgScrollbarModule } from 'ngx-scrollbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatCardModule } from '@angular/material/card';
import { MatExpansionModule } from '@angular/material/expansion';
import { DragDropModule } from '@angular/cdk/drag-drop';

@NgModule({
  declarations: [BrowseCategorySchemesComponent],
  imports: [
    CommonModule,
    AngularMaterialModule,
    NgScrollbarModule,
    MatTooltipModule,
    MatCardModule,
    MatExpansionModule,
    DragDropModule,
  ],
  exports: [BrowseCategorySchemesComponent],
})
export class BrowseCategorySchemesModule {}
