import { NgModule } from '@angular/core';
import { CommonModule, NgFor } from '@angular/common';
import { BrowseWebServicesComponent } from './browse-web-services/browse-web-services.component';
import { BrowseRoutingModule } from './browse-routing.module';
import { BrowseWebServicesItemComponent } from './browse-web-services/browse-web-services-item/browse-web-services-item.component';
import { SnackbarComponent } from 'src/components/snackbar/snackbar.component';
import { MatDialogRef } from '@angular/material/dialog';
import { AngularMaterialModule } from 'src/app/angular-material.module';
import { BrowseGroupsComponent } from './browse-groups/browse-groups.component';
import { BrowseDistributionComponent } from './browse-distribution/browse-distribution.component';
import { ComponentsModule } from 'src/components/components.module';
import { BrowseDistributionItemComponent } from './browse-distribution/browse-distribution-item/browse-distribution-item.component';
import { CreateWebServiceItemComponent } from './browse-web-services/create-web-service-item/create-web-service-item.component';
import { BrowseApplicationSoftwareComponent } from './browse-applicationSoftware/browse-applicationSoftware.component';
import { BrowseSoftwareSourceCodeComponent } from './browse-softwareSourceCode/browse-softwareSourceCode.component';
import { SideNavigationModule } from 'src/components/side-navigation/side-navigation.module';
import { BrowseRevisionsComponent } from './browse-revisions/browse-revisions.component';
import { FormatRangePipe } from 'src/pipes/formatRange.pipe';
import { BrowseDataProductsModule } from './browse-data-products/browse-data-products.module';
import { BrowseCategoriesModule } from './browse-categories/browse-categories.module';
import { BrowseCategorySchemesModule } from './browse-category-schemes/browse-category-schemes.module';
import { SkeletonLoaderComponent } from 'src/components/skeleton-loader/skeleton-loader.component';
import { BrowseSoftwareApplicationItemComponent } from './browse-applicationSoftware/browse-applicationSoftware-item/browse-applicationSoftware-item.component';
import { BrowseApplicationSoftwareModule } from './browse-applicationSoftware/browse-applicationSoftware.module';
import { BrowseSoftwareSourceCodeItemComponent } from './browse-softwareSourceCode/browse-softwareSourceCode-item/browse-softwareSourceCode-item.component';
import { BrowseSoftwareSourceCodeModule } from './browse-softwareSourceCode/browse-softwareSourceCode.module';

@NgModule({
  declarations: [
    BrowseWebServicesComponent,
    BrowseWebServicesItemComponent,
    SnackbarComponent,
    BrowseGroupsComponent,
    BrowseDistributionComponent,
    BrowseDistributionItemComponent,
    CreateWebServiceItemComponent,
    BrowseRevisionsComponent,
    BrowseApplicationSoftwareComponent,
    BrowseSoftwareApplicationItemComponent,
    BrowseSoftwareSourceCodeComponent,
    BrowseSoftwareSourceCodeItemComponent,
  ],
  imports: [
    CommonModule,
    BrowseRoutingModule,
    AngularMaterialModule,
    ComponentsModule,
    NgFor,
    SideNavigationModule,
    BrowseDataProductsModule,
    BrowseApplicationSoftwareModule,
    BrowseSoftwareSourceCodeModule,
    BrowseCategoriesModule,
    BrowseCategorySchemesModule,
    SkeletonLoaderComponent,
  ],
  exports: [],
  providers: [
    {
      provide: MatDialogRef,
      useValue: {},
    },
    FormatRangePipe,
  ],
})
export class BrowseModule {}
