import { CommonModule, NgFor } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { AngularMaterialModule } from 'src/app/angular-material.module';
import { ComponentsModule } from 'src/components/components.module';
import { SideNavigationModule } from 'src/components/side-navigation/side-navigation.module';
import { FormatRangePipe } from 'src/pipes/formatRange.pipe';
import { GeneralInformationComponent } from './browse-data-products-item/general-information/general-information.component';
import { SpatialCoverageComponent } from './browse-data-products-item/spatial-coverage/spatial-coverage.component';
import { TemporalCoverageComponent } from './browse-data-products-item/temporal-coverage/temporal-coverage.component';
import { PersistentIdentifierComponent } from './browse-data-products-item/persistent-identifier/persistent-identifier.component';
import { ContactPointComponent } from './browse-data-products-item/contact-point/contact-point.component';
import { ContactPointSearchComponent } from './browse-data-products-item/contact-point/contact-point-search/contact-point-search.component';
import { DataProvidersComponent } from './browse-data-products-item/data-providers/data-providers.component';
import { OperationParametersComponent } from './browse-data-products-item/operation-parameters/operation-parameters.component';
import { OptionIntegerComponent } from './browse-data-products-item/operation-parameters/option-integer/option-integer.component';
import { OptionDatetimeComponent } from './browse-data-products-item/operation-parameters/option-datetime/option-datetime.component';
import { OptionStringComponent } from './browse-data-products-item/operation-parameters/option-string/option-string.component';
import { OptionDateComponent } from './browse-data-products-item/operation-parameters/option-date/option-date.component';
import { OptionCoordinateComponent } from './browse-data-products-item/operation-parameters/option-coordinate/option-coordinate.component';
import { OptionBooleanComponent } from './browse-data-products-item/operation-parameters/option-boolean/option-boolean.component';
import { OptionFloatComponent } from './browse-data-products-item/operation-parameters/option-float/option-float.component';
import { ContactPointDetailComponent } from './browse-data-products-item/contact-point/contact-point-detail/contact-point-detail.component';
import { SpatialCoverageMapComponent } from './browse-data-products-item/spatial-coverage/spatial-coverage-map/spatial-coverage-map.component';
import { BrowseDataProductsItemComponent } from './browse-data-products-item/browse-data-products-item.component';
import { BrowseDataProductsComponent } from './browse-data-products.component';
import { CreateDataProductItemComponent } from './create-data-product-item/create-data-product-item.component';
import { SimpleSpatialControlComponent } from './browse-data-products-item/spatial-coverage/spatial-coverage-map/simpleSpatialControl/simpleSpatialControl.component';
import { OptionComponent } from './browse-data-products-item/operation-parameters/option/option.component';
import { OptionComplexComponent } from './browse-data-products-item/operation-parameters/option-complex/option-complex.component';
import { DistributionComponent } from './browse-data-products-item/distribution/distribution.component';
import { DistributionDownloadComponent } from './browse-data-products-item/distribution/download/download.component';
import { DistributionWebserviceComponent } from './browse-data-products-item/distribution/webservice/webservice.component';
import { SupportedOperationComponent } from './browse-data-products-item/supported-operation/supported-operation.component';
import { DocumentationComponent } from './browse-data-products-item/documentation/documentation.component';
import { PipesModule } from 'src/pipes/pipes.module';
import { ECVComponent } from './browse-data-products-item/ecv/ecv.component';

@NgModule({
  declarations: [
    BrowseDataProductsComponent,
    BrowseDataProductsItemComponent,
    ContactPointComponent,
    ContactPointDetailComponent,
    ContactPointSearchComponent,
    CreateDataProductItemComponent,
    DataProvidersComponent,
    GeneralInformationComponent,
    OperationParametersComponent,
    OptionBooleanComponent,
    OptionComplexComponent,
    OptionComponent,
    OptionCoordinateComponent,
    OptionDateComponent,
    OptionDatetimeComponent,
    OptionFloatComponent,
    OptionIntegerComponent,
    OptionStringComponent,
    PersistentIdentifierComponent,
    SimpleSpatialControlComponent,
    SpatialCoverageComponent,
    SpatialCoverageMapComponent,
    TemporalCoverageComponent,
    DistributionComponent,
    DistributionDownloadComponent,
    DistributionWebserviceComponent,
    SupportedOperationComponent,
    DocumentationComponent,
    ECVComponent
  ],
  imports: [AngularMaterialModule, CommonModule, ComponentsModule, NgFor, SideNavigationModule, PipesModule],
  exports: [
    BrowseDataProductsComponent,
    BrowseDataProductsItemComponent,
    ContactPointComponent,
    ContactPointDetailComponent,
    ContactPointSearchComponent,
    CreateDataProductItemComponent,
    DataProvidersComponent,
    GeneralInformationComponent,
    OperationParametersComponent,
    OptionBooleanComponent,
    OptionComplexComponent,
    OptionComponent,
    OptionCoordinateComponent,
    OptionDateComponent,
    OptionDatetimeComponent,
    OptionFloatComponent,
    OptionIntegerComponent,
    OptionStringComponent,
    PersistentIdentifierComponent,
    SimpleSpatialControlComponent,
    SpatialCoverageComponent,
    SpatialCoverageMapComponent,
    TemporalCoverageComponent,
    ECVComponent
  ],
  providers: [
    {
      provide: MatDialogRef,
      useValue: {},
    },
    FormatRangePipe,
  ],
})
export class BrowseDataProductsModule {}
