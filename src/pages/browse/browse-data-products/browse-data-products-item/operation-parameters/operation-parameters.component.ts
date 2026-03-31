import { Component, Input, OnInit, Output } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, UntypedFormGroup } from '@angular/forms';
import { DataProduct, Mapping, Operation } from 'generated/backofficeSchemas';
import { Subject } from 'rxjs';
import { ApiService } from 'src/apiAndObjects/api/api.service';
import { LinkedEntity } from 'src/apiAndObjects/objects/entities/linkedEntity.model';
import { DialogService } from 'src/components/dialogs/dialog.service';
import { EntityExecutionService } from 'src/services/calls/entity-execution.service';
import { StateChangeService } from 'src/services/stateChange.service';
import { Entity } from 'src/utility/enums/entity.enum';
import { EntityEndpointValue } from 'src/utility/enums/entityEndpointValue.enum';
import { OperationParamsRange } from 'src/utility/enums/operationParamsRange.enum';
import { Status } from 'src/utility/enums/status.enum';
import { ParametersFormService } from './parameters-form.service';
import { DialogData } from 'src/components/dialogs/baseDialogService.abstract';

@Component({
  selector: 'app-operation-parameters',
  templateUrl: './operation-parameters.component.html',
  styleUrls: ['./operation-parameters.component.scss'],
})
export class OperationParametersComponent implements OnInit {
  @Input() supportedOperations: LinkedEntity[] | undefined;

  @Input() templateUpdate = new Subject<string>();

  @Output() template = new Subject<string>();

  @Input() templateInput = '';

  @Output() mappingVals = new Subject<Mapping[]>();

  public paramsToUpdate: Array<Mapping> = [];

  public showAddParamButton!: boolean;

  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly apiService: ApiService,
    private readonly entityExecutionService: EntityExecutionService,
    private readonly dialogService: DialogService,
    private readonly stateChangeService: StateChangeService,
    private readonly formService: ParametersFormService,
  ) {
    this.stateChangeService.currentDataProductStateObs.subscribe((state: DataProduct['status'] | null) => {
      if (state == null || state === Status.PUBLISHED || state === Status.ARCHIVED || state === Status.DISCARDED) {
        this.disabled = true;
      } else {
        this.disabled = false;
      }
    });
  }

  private operation: Operation | null = null;

  public paramsForm!: UntypedFormGroup;

  public mapping: Mapping[] = [];

  public rangeEnum = OperationParamsRange;

  public loading = false;

  public disabled = false;

  public updateMappingArr(map: Mapping) {
    const indexofExistingItem = this.paramsToUpdate.findIndex((val) => val.instanceId === map.instanceId);
    if (indexofExistingItem < 0) {
      // if the new param does not exist them push it into array;
      this.paramsToUpdate.push(map);
    } else {
      // if item exists in array then replace at index n
      this.paramsToUpdate[indexofExistingItem] = map;
    }
    // Update parent component with latest params to allow creation of URI template;
    this.mappingVals.next(this.paramsToUpdate);

    this.entityExecutionService.setActiveMappingArr(this.paramsToUpdate);
  }

  public getControls(field: string) {
    return (this.paramsForm.get(field) as FormArray).controls;
  }

  private initData(): void {
    this.loading = true;
    if (this.supportedOperations?.length === 0) {
      this.loading = false;
    }
    const requests: Promise<Operation[]>[] = [];
    this.supportedOperations?.forEach((item: LinkedEntity) => {
      requests.push(
        this.apiService.endpoints[Entity.OPERATION].get.call(
          {
            metaId: item.metaId as string,
            instanceId: item.instanceId as string,
          },
          false,
        ),
      );
    });
    Promise.all(requests)
      .then((value: Operation[][]) => {
        const operation = value.flat().shift();
        if (operation) {
          this.operation = operation;
          this.initDataCallback();
        }
      })
      .catch(() => {
        this.loading = false;
      });
  }

  private getMappingDetails(mapping: LinkedEntity[] | undefined): Promise<Mapping[][]> {
    const requests: Promise<Mapping[]>[] = [];

    mapping?.forEach((item: LinkedEntity) => {
      requests.push(
        this.apiService.endpoints[Entity.MAPPING].get.call({
          metaId: item.metaId as string,
          instanceId: item.instanceId as string,
        }),
      );
    });
    return Promise.all(requests);
  }

  private initDataCallback(): void {
    if (this.operation == null) {
      this.loading = false;
      return;
    }

    this.entityExecutionService.setActiveOperation(this.operation);
    this.template?.next(this.operation.template ? this.operation.template : '');
    this.getMappingDetails(this.operation.mapping).then((mapping: Array<Array<Mapping>>) => {
      if (mapping) {
        this.loading = false;
        this.mapping = mapping.flat();
        this.mappingVals.next(mapping.flat());
        this.initForm(this.mapping);
      }
    });
  }

  private createMappingFormGroup(mapping: Mapping): FormGroup {
    return this.formService.generateOptionForm(mapping);
  }

  private loadMappingArray(mapping: Mapping[]): FormGroup[] {
    if (mapping) {
      const transformed = mapping.map((item: Mapping) => this.createMappingFormGroup(item));
      return transformed;
    }
    return [];
  }

  private initForm(flatMapping: Array<Mapping>): void {
    this.paramsForm = this.formBuilder.group({
      mapping: this.formBuilder.array(this.loadMappingArray(flatMapping)),
    });
    this.disabled ? this.paramsForm.disable() : this.paramsForm.enable();
  }

  private foundListParametersOnTemplate(): string[] {
    const template = this.templateInput;
    const regex = /{([^}]+)}/g;
    const match = template.match(regex);
    if (match) {
      return match.map((m: any) => m.slice(1, -1));
    } else {
      return [];
    }
  }

  private addMappingOnTemplate(mapping: Mapping) {
    const groupParamsOnTemplate = this.foundListParametersOnTemplate();
    if (groupParamsOnTemplate.length > 0) {
      const newString = `${groupParamsOnTemplate[0]}, ${mapping.variable}`;
      const template = this.templateInput;
      this.template.next(template.replace(groupParamsOnTemplate[0], newString));
    }
  }

  public ngOnInit(): void {
    this.initData();
  }

  public handleSave(): void {
    const operationToSave = this.operation ?? this.entityExecutionService.getActiveOperationValue();
    if (operationToSave == null) {
      return;
    }

    this.operation = operationToSave;
    this.entityExecutionService.setActiveOperation(operationToSave);
    this.entityExecutionService.handleOperationSave();
  }

  public handleAddParam(): void {
    this.dialogService.openAddNewParameterDialog().then((data: DialogData) => {
      const newMapping = data.dataOut as LinkedEntity;
      if (null != newMapping) {
        const linkedEntityParam: LinkedEntity = {
          entityType: Entity.MAPPING.toUpperCase(),
          instanceId: data.dataOut.instanceId,
          metaId: data.dataOut.metaId,
          uid: data.dataOut.uid,
        };
        const activeOperation = this.entityExecutionService.getActiveOperationValue();
        if (null != activeOperation) {
          activeOperation.mapping?.push(linkedEntityParam);
          this.entityExecutionService.setActiveOperation(activeOperation);
        }

        this.apiService.endpoints[Entity.MAPPING].get
          .call({
            metaId: newMapping.metaId as string,
            instanceId: newMapping.instanceId as string,
          })
          .then((map: Array<Mapping>) => {
            const newParam = map.shift() as Mapping;
            this.mapping.push(newParam);
            this.addMappingOnTemplate(newParam);
            this.initForm(this.mapping);
          });
      }
    });
  }

  public handleDeleteOperation(instanceId: string | undefined): void {
    if (instanceId) {
      const instanceToDelete = new Map<string, EntityEndpointValue>();
      instanceToDelete.set(instanceId, EntityEndpointValue.OPERATION);
      this.dialogService.handleDelete(instanceToDelete, false).then((toDelete: boolean) => {
        if (toDelete) {
          const activeWebservice = this.entityExecutionService.getActiveWebServiceValue();
          if (null != activeWebservice) {
            activeWebservice.supportedOperation?.splice(
              activeWebservice.supportedOperation.findIndex((e) => e.instanceId === instanceId),
              1,
            );
            this.entityExecutionService.setActiveWebService(activeWebservice);
          }

          const activeDistribution = this.entityExecutionService.getActiveDistributionValue();
          if (null != activeDistribution) {
            activeDistribution.accessURL?.splice(
              // activeDistribution.accessURL.findIndex((e) => e.instanceId === instanceId),
              1,
            );
            this.entityExecutionService.setActiveDistribution(activeDistribution);
          }
        }
      });
    }
  }

  public handleDeleteParam(instanceId: string) {
    if (instanceId) {
      const instanceToDelete = new Map<string, EntityEndpointValue>();
      instanceToDelete.set(instanceId, EntityEndpointValue.MAPPING);
      this.dialogService.handleDelete(instanceToDelete, false).then((toDelete: boolean) => {
        if (toDelete) {
          const activeOperation = this.entityExecutionService.getActiveOperationValue();
          if (null != activeOperation) {
            activeOperation?.mapping?.splice(
              activeOperation.mapping.findIndex((e) => e.instanceId === instanceId),
              1,
            );
            this.entityExecutionService.setActiveOperation(activeOperation);
            this.mapping.splice(
              this.mapping.findIndex((e) => e.instanceId === instanceId),
              1,
            );
            this.initForm(this.mapping);
          }
        }
      });
    }
  }
}
