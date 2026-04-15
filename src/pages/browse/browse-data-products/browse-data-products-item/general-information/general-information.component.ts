/* eslint-disable @typescript-eslint/no-explicit-any */
import { OnInit, Component } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, Validators, UntypedFormControl } from '@angular/forms';
import { debounceTime } from 'rxjs/operators';
import { DataProduct } from 'src/apiAndObjects/objects/entities/dataProduct.model';
import { EntityExecutionService } from 'src/services/calls/entity-execution.service';
import { HelpersService } from 'src/services/helpers.service';
import { Status } from 'src/utility/enums/status.enum';
import { AcrualPeriodicity } from 'src/utility/enums/vocabulary/accrualPeriodicity.enum';
import { DcmiType } from 'src/utility/enums/vocabulary/dcmiType.enum';
import { DataproductService } from '../../dataproduct.service';
import { DialogService } from 'src/components/dialogs/dialog.service';
import { DialogRevisionsComponent } from 'src/components/dialogs/dialog-revisions/dialog-revisions.component';
import { Entity } from 'src/utility/enums/entity.enum';
import { EntityEndpointValue } from 'src/utility/enums/entityEndpointValue.enum';
import { ActiveUserService } from 'src/services/activeUser.service';
import { ApiService } from 'src/apiAndObjects/api/api.service';
import { DistributionDetailDataSource } from 'src/apiAndObjects/objects/data-source/distributionDetailDataSource';
import { WebserviceDetailDataSource } from 'src/apiAndObjects/objects/data-source/webserviceDetailDataSource';
import { LoadingService } from 'src/services/loading.service';

@Component({
  selector: 'app-general-information',
  templateUrl: './general-information.component.html',
  styleUrl: './general-information.component.scss',
})
export class GeneralInformationComponent implements OnInit {
  public dataProduct: DataProduct;

  public form!: FormGroup;

  public stateEnum = Status;

  public floatLabelControl = new UntypedFormControl('auto');

  public accrualPeriodicityOptions: Array<{ id: string; name: string }> = [];

  public typeOptions: Array<{ id: string; name: string }> = [];

  public userHasEditPermissionsForSubmitted: boolean | undefined = undefined;

  constructor(
    private readonly helpersService: HelpersService,
    private readonly entityExecutionService: EntityExecutionService,
    private readonly dataProductService: DataproductService,
    private readonly dialogService: DialogService,
    private readonly activeUserService: ActiveUserService,
    private readonly apiService: ApiService,
    private readonly loadingService: LoadingService,

  ) {
    this.dataProduct = this.entityExecutionService.getActiveDataProductValue() as DataProduct;
  }

  private initForm(): void {
    if (this.dataProduct) {
      this.form = new FormGroup({
        title: new FormControl(this.dataProduct?.title, [Validators.required]),
        description: new FormControl(this.dataProduct?.description, [Validators.required]),
        keywords: new FormControl(HelpersService.whiteSpaceReplace(this.dataProduct?.keywords)),
        versionInfo: new FormControl(this.dataProduct?.versionInfo),
        accrualPeriodicity: new FormControl(this.dataProduct?.accrualPeriodicity),
        type: new FormControl(this.dataProduct?.type),
        issued: new FormControl(this.dataProduct?.issued),
        created: new FormControl(this.dataProduct?.created),
        modified: new FormControl(this.dataProduct?.modified),
        qualityAssurance: new FormControl(this.dataProduct?.qualityAssurance, [
          (control: AbstractControl): { [key: string]: any } | null => {
            if (control.value === '') {
              return null;
            }
            if (this.helpersService.isValidHttpUrl(control.value)) {
              return null;
            } else {
              control.markAsTouched();
              return { 'error-class': control.value };
            }
          },
        ]),
      });
      // check for User Role - if user not an ADMIN or REVIEWER can see the SUBMITTED, but can't edit them
      const activeUser = this.activeUserService.getActiveUser();
      if(activeUser){
        const activeUserGroups = activeUser.groups;
        if(activeUserGroups){
          // find group in UserGroups matching with current active loaded Entity
          const groupMatch = activeUserGroups.find(group => group.groupId === this.dataProduct?.groups?.find(entityGroup => entityGroup === group.groupId));
          if(groupMatch){
            const userRole = groupMatch.role;
            if(userRole && (userRole === 'ADMIN' || userRole === 'REVIEWER')){
              this.userHasEditPermissionsForSubmitted = true;
            }
            else{
              this.userHasEditPermissionsForSubmitted = false;
            }
          }
        }
      }
      if ((this.dataProduct?.status === Status.SUBMITTED && this.userHasEditPermissionsForSubmitted === false) || this.dataProduct?.status === Status.PUBLISHED || this.dataProduct?.status === Status.ARCHIVED) {
        this.form.disable();
      }
    }
  }

  private trackFormChanges(): void {
    const updatingObject = this.entityExecutionService.getActiveDataProductValue() || {};
    this.form.valueChanges.pipe(debounceTime(500)).subscribe((changes) => {
      this.dataProductService.updateDataProductRecord(updatingObject, {
        title: this.helpersService.formatArrayVal(changes.title),
        description: this.helpersService.formatArrayVal(changes.description),
        keywords: changes.keywords,
        versionInfo: changes.versionInfo,
        accrualPeriodicity: changes.accrualPeriodicity,
        type: changes.type,
        issued: changes.issued,
        created: changes.created,
        modified: changes.modified,
        qualityAssurance: changes.qualityAssurance,
      });
    });
  }

  public ngOnInit(): void {
    this.initForm();
    this.trackFormChanges();
    this.accrualPeriodicityOptions = Object.entries(AcrualPeriodicity).map((e) => ({ name: e[1], id: e[0] }));
    this.typeOptions = Object.entries(DcmiType).map((e) => ({ name: e[1], id: e[0] }));
  }

  public triggerVersionDialog(): void {
    this.dialogService.openDialogForComponent(
      DialogRevisionsComponent,
      {
        metaId: this.dataProduct?.metaId,
        type: Entity.DATA_PRODUCT,
        instanceId: this.dataProduct?.instanceId,
      },
      '65vw',
      'auto',
      'revisions-dialog',
    );
  }

  public async handleDeleteDataProduct(): Promise<void> {
    this.loadingService.setShowSpinner(true);


    const entitiesToDelete = new Map<string, EntityEndpointValue>();
    entitiesToDelete.set(this.dataProduct?.instanceId as string, EntityEndpointValue.DATA_PRODUCT);

    const logRejected = (results: PromiseSettledResult<unknown>[], context: string): void => {
      results.forEach((result) => {
        if (result.status === 'rejected') {
          console.warn(`${context}:`, result.reason);
        }
      });
    };

    const tasks: Promise<unknown>[] = [];

    const spatialCoverages = this.dataProduct?.spatialExtent || [];
    for (const spatCov of spatialCoverages) {
      tasks.push(
        this.apiService.endpoints.Location.get
          .call({
            metaId: spatCov.metaId as string,
            instanceId: spatCov.instanceId as string,
          }, false)
          .then((spCov) => {
            const filteredSpatCov = (spCov || []).filter((spatC) => spatC.status?.toUpperCase() === 'DRAFT');
            filteredSpatCov.forEach((spatialCoverage) => {
              entitiesToDelete.set(spatialCoverage.instanceId as string, EntityEndpointValue.LOCATION);
            });
          }),
      );
    }

    const temporalCoverages = this.dataProduct?.temporalExtent || [];
    for (const tempCov of temporalCoverages) {
      tasks.push(
        this.apiService.endpoints.PeriodOfTime.get
          .call({
            metaId: tempCov.metaId as string,
            instanceId: tempCov.instanceId as string,
          }, false)
          .then((tempCovResp) => {
            const filteredTempCov = (tempCovResp || []).filter((tC) => tC.status?.toUpperCase() === 'DRAFT');
            filteredTempCov.forEach((temporalCoverage) => {
              entitiesToDelete.set(temporalCoverage.instanceId as string, EntityEndpointValue.PERIOD_OF_TIME);
            });
          }),
      );
    }

    const identifiers = this.dataProduct?.identifier || [];
    for(const identif of identifiers){
      tasks.push(
        this.apiService.endpoints.Identifier.get
          .call({
            metaId: identif.metaId as string,
            instanceId: identif.instanceId as string,
          })
          .then((identifierResp)=>{
            const filteredIdentif = (identifierResp || []).filter((id) => id.status?.toUpperCase() === 'DRAFT');
            filteredIdentif.forEach((persistentIdentifier) => {
              entitiesToDelete.set(persistentIdentifier.instanceId as string, EntityEndpointValue.IDENTIFIER);
            });
          }),
      );
    }

    const distributions = this.dataProduct?.distribution || [];
    for (const dist of distributions) {

      tasks.push(
        (async () => {
          const distResp: DistributionDetailDataSource[] = await this.apiService.endpoints.Distribution.get.call({
            metaId: dist.metaId as string,
            instanceId: dist.instanceId as string,
          });

          // set the distributions to be deleted
          distResp.forEach((distribution) => {
            if(distribution.status?.toUpperCase() === 'DRAFT') {
              entitiesToDelete.set(distribution.instanceId as string, EntityEndpointValue.DISTRIBUTION);
            }
          });

          // Webservice section
          const webServiceTasks: Promise<unknown>[] = [];

          for (const distr of distResp || []) {
            const accessServices = distr.accessService || [];

            for (const webServ of accessServices) {

              webServiceTasks.push(
                (async () => {
                  const webServObj: WebserviceDetailDataSource[] = await this.apiService.endpoints.WebService.get.call({
                    metaId: webServ.metaId as string,
                    instanceId: webServ.instanceId as string,
                  }, false);
                  // set Webservices to be deleted
                  webServObj.forEach((webService)=> {
                    if(webService.status?.toUpperCase() === 'DRAFT') {
                      entitiesToDelete.set(webService.instanceId as string, EntityEndpointValue.WEBSERVICE);
                    }
                  });

                  // internal items of the Webservice to be checked for deletion
                  const documentationTasks: Promise<unknown>[] = [];
                  const spatialCoverageTasks: Promise<unknown>[] = [];
                  const temporalCoverageTasks: Promise<unknown>[] = [];
                  const operationTasks: Promise<unknown>[] = [];
                  const mappingTasks: Promise<unknown>[] = [];

                  for (const webServItem of webServObj || []) {
                    // Webservice - Documentation
                    const documentation = webServItem.documentation || [];
                    documentation.forEach((doc) => {
                      documentationTasks.push(
                        this.apiService.endpoints.Documentation.get
                          .call({
                            metaId: doc.metaId as string,
                            instanceId: doc.instanceId as string,
                          }) // Hello, this doesn't get cached apparently, so check if this is actually included in the Map !!
                          .then((documentationResp) => {
                            documentationResp.forEach((docRes) => {
                              if(docRes.status?.toUpperCase() === 'DRAFT') {
                                entitiesToDelete.set(docRes.instanceId as string, EntityEndpointValue.DOCUMENTATION);
                              }
                            })
                          }),
                      );
                    });

                    // Webservice - Spatial Coverage
                    const spatialCoverage = webServItem.spatialExtent || [];
                    spatialCoverage.forEach((spatialCov) => {
                      spatialCoverageTasks.push(
                        this.apiService.endpoints.Location.get
                          .call({
                            metaId: spatialCov.metaId as string,
                            instanceId: spatialCov.instanceId as string,
                          }, false)
                          .then((spatialCovResp) => {
                            const filteredSpatCov = (spatialCovResp || []).filter((sC) => sC.status?.toUpperCase() === 'DRAFT');
                            filteredSpatCov.forEach((spatCov) => {
                              entitiesToDelete.set(spatCov.instanceId as string, EntityEndpointValue.LOCATION);
                            });
                          }),
                      );
                    });

                    // Webservice - Temporal Coverage
                    const temporalCoverage = webServItem.temporalExtent || [];
                    temporalCoverage.forEach((temporalCov) => {
                      temporalCoverageTasks.push(
                        this.apiService.endpoints.PeriodOfTime.get
                          .call({
                            metaId: temporalCov.metaId as string,
                            instanceId: temporalCov.instanceId as string,
                          }, false)
                          .then((temporalCovResp) => {
                            const filteredTempCov = (temporalCovResp || []).filter((tC) => tC.status?.toUpperCase() === 'DRAFT');
                            filteredTempCov.forEach((tempCov) => {
                              entitiesToDelete.set(tempCov.instanceId as string, EntityEndpointValue.PERIOD_OF_TIME);
                            });
                          }),
                      );
                    });

                    // Webservice - Supported Operations
                    const supportedOperation = webServItem.supportedOperation || [];
                    for (const suppOp of supportedOperation) {
                      operationTasks.push(
                        this.apiService.endpoints.Operation.get
                          .call({
                            metaId: suppOp.metaId as string,
                            instanceId: suppOp.instanceId as string,
                          }, false)
                          .then((operationResp) => {
                            // set Operations to be deleted
                            operationResp.forEach((opRes) => {
                              if(opRes.status?.toUpperCase() === 'DRAFT') {
                                entitiesToDelete.set(opRes.instanceId as string, EntityEndpointValue.OPERATION);
                              }
                            });

                            (operationResp || []).forEach((opRes) => {
                              (opRes.mapping || []).forEach((mapp) => {
                                mappingTasks.push(
                                  this.apiService.endpoints.Mapping.get
                                    .call({
                                      metaId: mapp.metaId as string,
                                      instanceId: mapp.instanceId as string,
                                    }) // Hello, same as Documentation (if issue is actually with cache, this should be solved a s well) !!
                                    .then((mappingResp) => {
                                      // Mapping 
                                      mappingResp.forEach((mapRes) => {
                                        if(mapRes.status?.toUpperCase() === 'DRAFT') {
                                          entitiesToDelete.set(mapRes.instanceId as string, EntityEndpointValue.MAPPING);
                                        }
                                      })
                                    })
                                );
                              });
                            });
                          }),
                      );
                    }
                  }

                  const documentationSettled = await Promise.allSettled(documentationTasks);
                  logRejected(documentationSettled, "Couldn't retrieve Documentation for deletion");
                  const spatialCoverageSettled = await Promise.allSettled(spatialCoverageTasks);
                  logRejected(spatialCoverageSettled, "Couldn't retrieve Spatial Coverages for deletion");
                  const temporalCoverageSettled = await Promise.allSettled(temporalCoverageTasks);
                  logRejected(temporalCoverageSettled, "Couldn't retrieve Temporal Coverages for deletion");
                  const operationSettled = await Promise.allSettled(operationTasks);
                  logRejected(operationSettled, "Couldn't retrieve Operations/Mappings for deletion");
                  const mappingSettled = await Promise.allSettled(mappingTasks);
                  logRejected(mappingSettled, "Couldn't retrieve Mappings for deletion");
                })(),
              );
            }
          }

          const webServicesSettled = await Promise.allSettled(webServiceTasks);
          logRejected(webServicesSettled, "Couldn't retrieve WebServices for deletion");
        })(),
      );
    }

    const settled = await Promise.allSettled(tasks).finally(()=>
      this.loadingService.setShowSpinner(false)
    );
    logRejected(settled, "Couldn't preload some entities for deletion");

    this.dialogService.handleDelete(entitiesToDelete);
  }
}
