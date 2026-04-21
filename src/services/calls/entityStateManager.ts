import {
  DataProduct,
  WebService,
  Distribution,
  Operation,
  ContactPoint,
  Mapping,
  SoftwareApplication,
  SoftwareSourceCode,
} from 'generated/backofficeSchemas';
import { BehaviorSubject } from 'rxjs';
import { ContactPoint as ContactPointModel } from 'src/apiAndObjects/objects/entities/contactPoint.model';
import { DataProduct as DataProductModel } from 'src/apiAndObjects/objects/entities/dataProduct.model';
import { Distribution as DistributionModel } from 'src/apiAndObjects/objects/entities/distribution.model';
import { SoftwareApplication as SoftwareApplicationModel } from 'src/apiAndObjects/objects/entities/softwareApplication.model';
import { SoftwareSourceCode as SoftwareSourceCodeModel } from 'src/apiAndObjects/objects/entities/softwareSourceCode.model';
import { Operation as OperationModel } from 'src/apiAndObjects/objects/entities/operation.model';
import { WebService as WebServiceModel } from 'src/apiAndObjects/objects/entities/webService.model';

export class EntityStateManager {
  public readonly dataProduct = new BehaviorSubject<DataProduct | null>(null);
  public dataProductObs = this.dataProduct.asObservable();

  public readonly distribution = new BehaviorSubject<Distribution | null>(null);
  public distributionObs = this.distribution.asObservable();

  public readonly softwareApplication = new BehaviorSubject<SoftwareApplication | null>(null);
  public softwareApplicationObs = this.softwareApplication.asObservable();

  public readonly softwareSourceCode = new BehaviorSubject<SoftwareSourceCode | null>(null);
  public softwareSourceCodeObs = this.softwareSourceCode.asObservable();

  public readonly contactPoint = new BehaviorSubject<ContactPoint | null>(null);
  public contactPointObs = this.contactPoint.asObservable();

  public readonly webService = new BehaviorSubject<WebService | null>(null);
  public webServiceObs = this.webService.asObservable();

  public readonly operation = new BehaviorSubject<Operation | null>(null);
  public operationObs = this.operation.asObservable();

  public readonly mapping = new BehaviorSubject<Array<Mapping>>([]);
  public mappingObs = this.mapping.asObservable();

  /**
   * Sets active DataProduct
   */
  public setActiveDataProduct(dataProduct: DataProduct): void {
    this.dataProduct.next(dataProduct);
  }

  /**
   * Gets active DataProduct
   */
  public getActiveDataProductValue(): DataProduct | null {
    return this.dataProduct.getValue();
  }

  /**
   * Sets active Distribution
   */
  public setActiveDistribution(distribution: Distribution): void {
    this.distribution.next(distribution);
  }

  /**
   * Gets active Distribution
   */
  public getActiveDistributionValue(): Distribution | null {
    return this.distribution.getValue();
  }

  /**
   * Sets active SoftwareApplication
   */
  public setActiveSoftwareApplication(softApp: SoftwareApplication): void {
    this.softwareApplication.next(softApp);
  }

  /**
   * Gets active SoftwareApplication
   */
  public getActiveSoftwareApplicationValue(): SoftwareApplication | null {
    return this.softwareApplication.getValue();
  }

  /**
   * Sets active SoftwareSourceCode
   */
  public setActiveSoftwareSourceCode(sourceCode: SoftwareSourceCode): void {
    this.softwareSourceCode.next(sourceCode);
  }
  /**
   * Gets active SoftwareSourceCode
   */
  public getActiveSoftwareSourceCodeValue(): SoftwareSourceCode | null {
    return this.softwareSourceCode.getValue();
  }

  /**
   * Sets active Distribution
   */
  public setActiveContactPoint(contactPoint: ContactPoint): void {
    this.contactPoint.next(contactPoint);
  }

  /**
   * Gets active Distribution
   */
  public getActiveContactPointValue(): ContactPoint | null {
    return this.contactPoint.getValue();
  }

  /**
   * Sets active WebService
   */
  public setActiveWebService(webService: WebService): void {
    this.webService.next(webService);
  }

  /**
   * Gets active WebService
   */
  public getActiveWebServiceValue(): WebService | null {
    return this.webService.getValue();
  }

  /**
   * Sets active Operation
   */
  public setActiveOperation(operation: Operation): void {
    this.operation.next(operation);
  }

  /**
   * Gets active Operation
   */
  public getActiveOperationValue(): Operation | null {
    return this.operation.getValue();
  }

  /**
   * Sets active Mapping Array
   */
  public setActiveMappingArr(mapping: Array<Mapping>): void {
    this.mapping.next(mapping);
  }

  /**
   * Gets active Mapping Array
   */
  public getActiveMappingArrValue(): Array<Mapping> {
    return this.mapping.getValue();
  }

  /**
   * The function `convertToDataProduct` takes an initial `DataProduct` object and
   * converts it into a `DataProductModel` object.
   * @param {DataProduct} initial - The `initial` parameter is an object of type
   * `DataProduct`. It contains various properties that are used to initialize a new
   * instance of the `DataProduct` class.
   * @returns an instance of the `DataProduct` class.
   */
  public convertToDataProduct(initial: DataProduct): DataProductModel {
    const exportVar = new DataProductModel(
      initial.accessRight,
      initial.accrualPeriodicity,
      initial.category,
      initial.changeComment,
      initial.changeTimestamp,
      initial.contactPoint,
      initial.created,
      initial.description,
      initial.distribution,
      initial.documentation,
      initial.editorId,
      initial.fileProvenance,
      initial.groups,
      initial.hasPart,
      initial.identifier,
      initial.instanceChangedId,
      initial.instanceId,
      initial.isPartOf,
      initial.issued,
      initial.keywords,
      initial.metaId,
      initial.modified,
      initial.operation,
      initial.provenance,
      initial.publisher,
      initial.qualityAssurance,
      initial.relation,
      initial.spatialExtent,
      initial.status,
      initial.temporalExtent,
      initial.title,
      initial.toBeDelete,
      initial.type,
      initial.uid,
      initial.version,
      initial.versionInfo,
    );
    return exportVar;
  }

  /**
   * The function `convertToDistribution` takes an initial `Distribution` object and
   * returns a new `DistributionModel` object with the same properties.
   * @param {Distribution} initial - The `initial` parameter is of type
   * `Distribution`. It is an object that contains various properties representing the
   * details of a distribution.
   * @returns an instance of the `Distribution` class.
   */
  public convertToDistribution(initial: Distribution): DistributionModel {
    const exportVar = new DistributionModel(
      initial.uid,
      initial.accessURL,
      initial.changeComment,
      initial.changeTimestamp,
      initial.dataPolicy,
      initial.dataProduct,
      initial.description,
      initial.downloadURL,
      initial.editorId,
      initial.fileProvenance,
      initial.format,
      initial.groups,
      initial.instanceChangedId,
      initial.instanceId,
      initial.issued,
      initial.licence,
      initial.metaId,
      initial.modified,
      initial.operation,
      initial.status,
      initial.supportedOperation,
      initial.title,
      initial.toBeDelete,
      initial.type,
      initial.version,
    );
    return exportVar;
  }

  /**
   * The function `convertToSoftwareApplication` takes an initial `SoftawareAApplication` object and
   * returns a new `SoftwareApplicationModel` object with the same properties.
   * @param {SoftwareApplication} initial - The `initial` parameter is of type
   * `SoftawareApplication`. It is an object that contains various properties representing the
   * details of a softwareApplication.
   * @returns an instance of the `SoftwareApplication` class.
   */
  public convertToSoftwareApplication(initial: SoftwareApplication): SoftwareApplicationModel {
    const exportVar = new SoftwareApplicationModel(
      initial.author,
      initial.category,
      initial.changeComment,
      initial.changeTimestamp,
      initial.citation,
      initial.contactPoint,
      initial.contributor,
      initial.creator,
      initial.description,
      initial.downloadURL,
      initial.editorId,
      initial.fileProvenance,
      initial.fileSize,
      initial.funder,
      initial.groups,
      initial.identifier,
      initial.inputParameter,
      initial.installURL,
      initial.instanceChangedId,
      initial.instanceId,
      initial.keywords,
      initial.licenseURL,
      initial.mainEntityOfPage,
      initial.maintainer,
      initial.memoryrequirements,
      initial.metaId,
      initial.name,
      initial.operatingSystem,
      initial.operation,
      initial.outputParameter,
      initial.parameter,
      initial.processorRequirements,
      initial.provider,
      initial.publisher,
      initial.relatedOperation,
      initial.requirements,
      initial.softwareStatus,
      initial.softwareVersion,
      initial.spatial,
      initial.status,
      initial.storageRequirements,
      initial.temporal,
      initial.timeRequired,
      initial.toBeDelete,
      initial.uid,
      initial.version,
      initial.versionId,
    );
    return exportVar;
  }

  /**
   * The function `convertToSoftwareSourceCode` takes an initial `SoftwareSourceCode` object and
   * returns a new `SoftwareSourceCodeModel` object with the same properties.
   * @param {SoftwareApplication} initial - The `initial` parameter is of type
   * `SoftwareSourceCode`. It is an object that contains various properties representing the
   * details of a softwareSourceCode.
   * @returns an instance of the `SoftwareSourceCode` class.
   */
  public convertToSoftwareSourceCode(initial: SoftwareSourceCode): SoftwareSourceCodeModel {
    const exportVar = new SoftwareSourceCodeModel(
      initial.author,
      initial.category,
      initial.changeComment,
      initial.changeTimestamp,
      initial.citation,
      initial.codeRepository,
      initial.contactPoint,
      initial.contributor,
      initial.creator,
      initial.description,
      initial.downloadURL,
      initial.editorId,
      initial.fileProvenance,
      initial.funder,
      initial.groups,
      initial.identifier,
      initial.instanceChangedId,
      initial.instanceId,
      initial.keywords,
      initial.licenseURL,
      initial.mainEntityofPage,
      initial.maintainer,
      initial.metaId,
      initial.name,
      initial.operation,
      initial.programmingLanguage,
      initial.provider,
      initial.publisher,
      initial.relation,
      initial.runtimePlatform,
      initial.size,
      initial.softwareRequirements,
      initial.softwareStatus,
      initial.softwareVersion,
      initial.spatial,
      initial.status,
      initial.temporal,
      initial.timeRequired,
      initial.toBeDelete,
      initial.uid,
      initial.version,
      initial.versionId,
    );

    return exportVar;
  }

  /**
   * The function converts an initial ContactPoint object into a ContactPointModel object and
   * returns it.
   * @param {ContactPoint} initial - The `initial` parameter is an object of type
   * `ContactPoint`. It contains various properties such as `uid`, `changeComment`,
   * `changeTimestamp`, `editorId`, `email`, `fileProvenance`, `groups`, `instanceChangedId`,
   * `instanceId`, `language
   * @returns an instance of the `ContactPoint` class.
   */
  public convertToContactPoint(initial: ContactPoint): ContactPointModel {
    const exportVar = new ContactPointModel(
      initial.uid,
      initial.changeComment,
      initial.changeTimestamp,
      initial.editorId,
      initial.email,
      initial.fileProvenance,
      initial.groups,
      initial.instanceChangedId,
      initial.instanceId,
      initial.language,
      initial.metaId,
      initial.operation,
      initial.organization,
      initial.person,
      initial.role,
      initial.status,
      initial.telephone,
      initial.toBeDelete,
      initial.version,
    );
    return exportVar;
  }

  /**
   * The function converts an initial WebserviceDetailDataSource object into a WebService object and
   * returns it.
   * @param {WebserviceDetailDataSource} initial - The `initial` parameter is of type
   * `WebserviceDetailDataSource`. It is an object that contains various properties representing the
   * details of a web service.
   * @returns an instance of the WebService class.
   */
  public convertToWebService(initial: WebService): WebServiceModel {
    const exportVar = new WebServiceModel(
      initial.uid,
      initial.aaaiTypes,
      initial.category,
      initial.changeComment,
      initial.changeTimestamp,
      initial.contactPoint,
      initial.dateModified,
      initial.datePublished,
      initial.description,
      initial.distribution,
      initial.documentation,
      initial.editorId,
      initial.entryPoint,
      initial.fileProvenance,
      initial.identifier,
      initial.instanceChangedId,
      initial.instanceId,
      initial.keywords,
      initial.license,
      initial.metaId,
      initial.name,
      initial.operation,
      initial.provider,
      initial.spatialExtent,
      initial.status,
      initial.supportedOperation,
      initial.temporalExtent,
      initial.toBeDelete,
      initial.version,
    );
    return exportVar;
  }

  /**
   * The function converts an initial Operation object into an OperationModel object.
   * @param {Operation} initial - The `initial` parameter is an object of type
   * `Operation`. It contains various properties that are used to initialize a new
   * `Operation` object.
   * @returns an instance of the `Operation` class.
   */
  public convertToOperation(initial: Operation): OperationModel {
    const exportVar = new OperationModel(
      initial.changeComment,
      initial.changeTimestamp,
      initial.editorId,
      initial.fileProvenance,
      initial.groups,
      initial.instanceChangedId,
      initial.instanceId,
      initial.mapping,
      initial.metaId,
      initial.method,
      initial.operation,
      initial.returns,
      initial.status,
      initial.template,
      initial.toBeDelete,
      initial.uid,
      initial.version,
    );
    return exportVar;
  }
}
