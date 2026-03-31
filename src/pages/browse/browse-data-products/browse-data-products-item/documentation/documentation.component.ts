import { Component, Input, OnInit } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { DataProduct, Documentation, LinkedEntity, WebService } from 'generated/backofficeSchemas';
import { ApiService } from 'src/apiAndObjects/api/api.service';
import { GetDocumentationParams } from 'src/apiAndObjects/api/documentation/getDocumentation';
import { DocumentationDataSource } from 'src/apiAndObjects/objects/data-source/documentationDetailDataSource';
import { DialogService } from 'src/components/dialogs/dialog.service';
import { EntityExecutionService } from 'src/services/calls/entity-execution.service';
import { HelpersService } from 'src/services/helpers.service';
import { LoadingService } from 'src/services/loading.service';
import { SnackbarService, SnackbarType } from 'src/services/snackbar.service';
import { Entity } from 'src/utility/enums/entity.enum';
import { EntityEndpointValue } from 'src/utility/enums/entityEndpointValue.enum';
import { Status } from 'src/utility/enums/status.enum';

@Component({
  selector: 'app-documentation',
  templateUrl: './documentation.component.html',
  styleUrl: './documentation.component.scss',
})
export class DocumentationComponent implements OnInit {
  @Input() dataProduct!: DataProduct | null;

  @Input() set webservice(value: WebService) {
    if (value) this.activeWebservice = value;
    if (value.documentation) {
      this.documentationLinkedEntities = value.documentation;
      this.initDocumentations(this.documentationLinkedEntities);
    }
  }

  public documentationEntities: Array<Documentation> = [];
  public documentationLinkedEntities: LinkedEntity[] = [];
  public activeWebservice!: WebService;
  public form!: FormGroup;
  public disabled = true;

  constructor(
    private readonly apiService: ApiService,
    private readonly formBuilder: FormBuilder,
    private readonly helpersService: HelpersService,
    private readonly loadingService: LoadingService,
    private readonly snackbarService: SnackbarService,
    private readonly entityExecutionService: EntityExecutionService,
    private readonly dialogService: DialogService,
  ) {}

  public ngOnInit(): void {
    this.disabled = this.dataProduct?.status === Status.PUBLISHED || this.dataProduct?.status === Status.ARCHIVED;
  }

  private initDocumentations(documentationLinkedEntities: Array<LinkedEntity>) {
    if (documentationLinkedEntities.length > 0) {
      this.loadingService.setShowSpinner(true);
    }

    documentationLinkedEntities.forEach((location: LinkedEntity) => {
      const params: GetDocumentationParams = {
        instanceId: location.instanceId as string,
        metaId: location.metaId as string,
      };
      this.apiService.endpoints.Documentation.get
        .call(params)
        .then((items: Array<Documentation>) => {
          items.forEach((doc) => {
            this.documentationEntities.push(doc);
          });
          this.initFormArr();
        })
        .finally(() => this.loadingService.setShowSpinner(false));
    });
  }

  private initFormArr(): void {
    this.form = this.formBuilder.group({
      documentations: new FormArray(
        this.documentationEntities.map((documentation: Documentation) => {
          return new FormGroup({
            title: new FormControl(documentation.title, [Validators.required]),
            description: new FormControl(documentation.description),
            uri: new FormControl(documentation.uri, [
              Validators.required,
              (control: AbstractControl): { [key: string]: unknown } | null => {
                if (this.helpersService.isValidHttpUrl(control.value)) {
                  return null;
                } else {
                  control.markAsTouched();
                  return { 'error-class': control.value };
                }
              },
            ]),
          });
        }),
      ),
    });
    this.disabled ? this.form.disable() : this.form.enable();
  }

  public getControls(field: string): AbstractControl<unknown, unknown>[] {
    return (this.form.get(field) as FormArray).controls;
  }

  public handleCreate() {
    this.apiService.endpoints.Documentation.create
      .call({ title: 'New Documentation' })
      .then((doc: DocumentationDataSource) => {
        const newDoc: LinkedEntity = {
          entityType: Entity.DOCUMENTATION,
          instanceId: doc.instanceId,
          metaId: doc.metaId,
          uid: doc.uid,
        };
        const activeWebService = this.activeWebservice;
        activeWebService?.documentation?.push(newDoc);
        if (activeWebService) {
          this.entityExecutionService.setActiveWebService(activeWebService);
          this.entityExecutionService.handleWebserviceSave();
          this.apiService.endpoints.Documentation.get
            .call({ metaId: newDoc.metaId!, instanceId: newDoc.instanceId! })
            .then((doc: Array<Documentation>) => {
              this.documentationEntities.push(doc[0]);
              this.initFormArr();
            });
        }
      });
  }

  public handleSave(i: number) {
    this.loadingService.setShowSpinner(true);
    const arrayControl = this.form.get('documentations') as FormArray;
    const docToUpdate = this.documentationEntities[i];
    docToUpdate.title = arrayControl.at(i).value.title;
    docToUpdate.description = arrayControl.at(i).value.description;
    docToUpdate.uri = arrayControl.at(i).value.uri;
    this.apiService.endpoints.Documentation.update
      .call(docToUpdate)
      .then(() => {
        this.snackbarService.openSnackbar('Successfully saved Documentation', 'Close', SnackbarType.SUCCESS, 3000, [
          'snackbar',
          'mat-toolbar',
          'snackbar-success',
        ]);
      })
      .catch((err) => {
        console.error(err);
        this.snackbarService.openSnackbar('Error updating Documentation.', 'Close', SnackbarType.ERROR, 3000, [
          'snackbar',
          'mat-toolbar',
          'snackbar-error',
        ]);
      })
      .finally(() => this.loadingService.setShowSpinner(false));
  }

  public handleDelete(i: number) {
    const docToRemove = this.documentationEntities[i];
    if (docToRemove.instanceId) {
      const toDelete = new Map<string, EntityEndpointValue>();
      toDelete.set(docToRemove.instanceId, EntityEndpointValue.DOCUMENTATION);
      this.dialogService
        .handleDelete(toDelete, false)
        .then(() => {
          this.documentationEntities.splice(i, 1);
          const activeWebService = this.activeWebservice;
          activeWebService?.documentation?.splice(i, 1);
          (this.form.get('documentations') as FormArray).removeAt(i);
          if (activeWebService) {
            this.entityExecutionService.setActiveWebService(activeWebService);
            this.entityExecutionService.handleWebserviceSave();
          }
        })
        .catch((err) => {
          console.error(err);
          this.snackbarService.openSnackbar('Error deleting entity.', 'Close', SnackbarType.ERROR, 3000, [
            'snackbar',
            'mat-toolbar',
            'snackbar-error',
          ]);
        });
    }
  }
}
