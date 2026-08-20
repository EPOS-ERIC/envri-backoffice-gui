import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LayoutComponent } from 'src/components/layout/layout.component';
import { BrowseDataProductsComponent } from './browse-data-products/browse-data-products.component';
import { BrowseWebServicesItemComponent } from './browse-web-services/browse-web-services-item/browse-web-services-item.component';
import { BrowseWebServicesComponent } from './browse-web-services/browse-web-services.component';
import { BrowseDataProductsItemComponent } from './browse-data-products/browse-data-products-item/browse-data-products-item.component';
import { BrowseGroupsComponent } from './browse-groups/browse-groups.component';
import { BrowseDistributionComponent } from './browse-distribution/browse-distribution.component';
import { BrowseDistributionItemComponent } from './browse-distribution/browse-distribution-item/browse-distribution-item.component';
import { EntityEndpointValue } from 'src/utility/enums/entityEndpointValue.enum';
import { BrowseRevisionsComponent } from './browse-revisions/browse-revisions.component';
import { BrowseApplicationSoftwareComponent } from './browse-applicationSoftware/browse-applicationSoftware.component';
import { BrowseSoftwareApplicationItemComponent } from './browse-applicationSoftware/browse-applicationSoftware-item/browse-applicationSoftware-item.component';
import { BrowseSoftwareSourceCodeComponent } from './browse-softwareSourceCode/browse-softwareSourceCode.component';
import { BrowseSoftwareSourceCodeItemComponent } from './browse-softwareSourceCode/browse-softwareSourceCode-item/browse-softwareSourceCode-item.component';
import { BrowseCategoriesComponent } from './browse-categories/browse-categories.component';
import { BrowseCategorySchemesComponent } from './browse-category-schemes/browse-category-schemes.component';

const routes: Routes = [
  {
    path: EntityEndpointValue.WEBSERVICE,
    component: LayoutComponent,
    children: [
      { path: '', component: BrowseWebServicesComponent },
      { path: 'details/:metaId/:id', component: BrowseWebServicesItemComponent },
    ],
  },
  {
    path: EntityEndpointValue.DISTRIBUTION,
    component: LayoutComponent,
    children: [
      { path: '', component: BrowseDistributionComponent },
      { path: 'details/:metaId/:id', component: BrowseDistributionItemComponent },
    ],
  },
  {
    path: EntityEndpointValue.DATA_PRODUCT,
    component: LayoutComponent,
    children: [
      { path: '', component: BrowseDataProductsComponent, pathMatch: 'full' },
      { path: 'details/:metaId/:id', component: BrowseDataProductsItemComponent },
    ],
  },
  {
    path: EntityEndpointValue.APPLICATION_SOFTWARE,
    component: LayoutComponent,
    children: [
      { path: '', component: BrowseApplicationSoftwareComponent, pathMatch: 'full' },
      { path: 'details/:metaId/:id', component: BrowseSoftwareApplicationItemComponent },
    ],
  },
  {
    path: EntityEndpointValue.SOFTWARE_SOURCE_CODE,
    component: LayoutComponent,
    children: [
      { path: '', component: BrowseSoftwareSourceCodeComponent, pathMatch: 'full' },
      { path: 'details/:metaId/:id', component: BrowseSoftwareSourceCodeItemComponent },
    ],
  },

  {
    path: 'revisions',
    component: LayoutComponent,
    children: [{ path: 'compare/:id', component: BrowseRevisionsComponent }],
  },
  {
    path: 'groups',
    component: LayoutComponent,
    children: [{ path: '', component: BrowseGroupsComponent }],
  },
  {
    path: EntityEndpointValue.CATEGORY,
    component: LayoutComponent,
    children: [{ path: '', component: BrowseCategoriesComponent }],
  },
  {
    path: EntityEndpointValue.CATEGORY_SCHEME,
    component: LayoutComponent,
    children: [{ path: '', component: BrowseCategorySchemesComponent }],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class BrowseRoutingModule {}
