/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, OnInit } from '@angular/core';
import {
  FormArray,
  FormGroup,
  FormControl,
  Validators,
  UntypedFormControl,
  UntypedFormGroup,
  UntypedFormArray,
} from '@angular/forms';
import { Identifier, LinkedEntity } from 'generated/backofficeSchemas';
import { EntityExecutionService } from 'src/services/calls/entity-execution.service';
import { Status } from 'src/utility/enums/status.enum';
import { SoftwareSourceCodeService } from '../../softwareSourceCode.service';
import { ApiService } from 'src/apiAndObjects/api/api.service';
import { GetIdentifierDetailsParams } from 'src/apiAndObjects/api/identifier/getIdentifier';
import { EntityEndpointValue } from 'src/utility/enums/entityEndpointValue.enum';
import { LoadingService } from 'src/services/loading.service';
import { SnackbarService, SnackbarType } from 'src/services/snackbar.service';
import { SoftwareSourceCode } from 'src/apiAndObjects/objects/entities/softwareSourceCode.model';
import { ActiveUserService } from 'src/services/activeUser.service';

@Component({
  selector: 'app-persistent-identifier-sourceCode',
  templateUrl: './persistent-identifier.component.html',
  styleUrl: './persistent-identifier.component.scss',
})
export class PersistentIdentifierSourceCodeComponent implements OnInit {
  public softwareSourceCode: SoftwareSourceCode;

  public form!: UntypedFormGroup;

  public stateEnum = Status;

  public floatLabelControl = new UntypedFormControl('auto');

  public identifiersFullObj: Array<Identifier> = [];

  public get identifierArray() {
    return this.form.get('identifier') as UntypedFormArray;
  }

  public disabled = false;

  constructor(
    private readonly entityExecutionService: EntityExecutionService,
    private readonly softwareSourceCodeService: SoftwareSourceCodeService,
    private readonly apiService: ApiService,
    private readonly loadingService: LoadingService,
    private readonly snackbarService: SnackbarService,
    private readonly activeUserService: ActiveUserService,
  ) {
    this.softwareSourceCode = this.entityExecutionService.getActiveSoftwareSourceCodeValue() as SoftwareSourceCode;
  }

  public ngOnInit(): void {
    this.form = new FormGroup({
      identifier: this.createIdentifierArray(this.softwareSourceCode?.identifier),
    });
    let userHasEditPermissionsForSubmitted: boolean | undefined = false;
    setTimeout(() => {
      this.snackbarService.openSnackbar(
        `Please save changes of each Persistent Identifier.`,
        'close',
        SnackbarType.WARNING,
        12000,
        ['snackbar', 'mat-toolbar', 'snackbar-warning'],
      );
    }, 500);
    // check for User Role - if user not an ADMIN or REVIEWER can see the SUBMITTED, but can't edit them
    const activeUser = this.activeUserService.getActiveUser();
    if(activeUser){
      const activeUserGroups = activeUser.groups;
      if(activeUserGroups){
        // find group in UserGroups matching with current active loaded Entity
        const groupMatch = activeUserGroups.find(group => group.groupId === this.softwareSourceCode?.groups?.find(entityGroup => entityGroup === group.groupId));
        if(groupMatch){
          const userRole = groupMatch.role;
          console.warn('userRole', userRole);
          if(userRole && (userRole === 'ADMIN' || userRole === 'REVIEWER')){
            userHasEditPermissionsForSubmitted = true;
          }
          else{
            userHasEditPermissionsForSubmitted = false;
          }
        }
      }
    }
    if ((this.softwareSourceCode?.status === Status.SUBMITTED && userHasEditPermissionsForSubmitted === false) || this.softwareSourceCode?.status === Status.PUBLISHED || this.softwareSourceCode?.status === Status.ARCHIVED) {
      this.form.disable();
      this.disabled = true;
    }
  }

  private createIdentifierArray(identifier?: Identifier[] | undefined): UntypedFormArray {
    const arr = new UntypedFormArray([]);
    identifier?.forEach((item: LinkedEntity) => {
      const identifierParams: GetIdentifierDetailsParams = {
        metaId: item.metaId!,
        instanceId: item.instanceId!,
      };
      this.apiService.endpoints.Identifier.get
        .call(identifierParams)
        .then((item: Identifier[]) => {
          this.identifiersFullObj.push(item[0]);
          arr.push(
            new FormGroup({
              identifier: new FormControl(item[0].identifier, [Validators.required]),
              type: new FormControl(item[0].type, [Validators.required]),
            }),
          );
        })
        .finally(() => {
          if (
            this.softwareSourceCode?.status === Status.PUBLISHED ||
            this.softwareSourceCode?.status === Status.ARCHIVED
          ) {
            this.form.disable();
          }
        });
    });
    return arr;
  }

  public handleAddIdentifier(): void {
    this.loadingService.setShowSpinner(true);
    this.apiService.endpoints.Identifier.create
      .call()
      .then((item: Identifier) => {
        this.identifiersFullObj.push(item);
        const linkedEntity: LinkedEntity = {
          entityType: 'IDENTIFIER', // Sending 'Identifier' string in any form other than capitalized causes 500 from the server.
          instanceId: item.instanceId,
          metaId: item.metaId,
          uid: item.uid,
        };
        const updatingObject = this.entityExecutionService.getActiveSoftwareSourceCodeValue() || {};
        const identifierArr = updatingObject.identifier!;
        identifierArr.push(linkedEntity);
        this.softwareSourceCodeService.updateSoftwareSourceCodeRecord(updatingObject, { identifier: identifierArr });
        this.entityExecutionService.handleSoftwareSourceCodeSave();

        this.identifierArray.push(
          new FormGroup({
            identifier: new FormControl('', [Validators.required]),
            type: new FormControl('', [Validators.required]),
          }),
        );
        this.snackbarService.openSnackbar('Successfully added Identifier.', 'Close', SnackbarType.SUCCESS, 3000, [
          'snackbar',
          'mat-toolbar',
          'snackbar-success',
        ]);
      })
      .catch(() => {
        this.snackbarService.openSnackbar('Error adding Identifier.', 'Close', SnackbarType.ERROR, 3000, [
          'snackbar',
          'mat-toolbar',
          'snackbar-error',
        ]);
      })
      .finally(() => {
        this.loadingService.setShowSpinner(false);
      });
  }

  public handleDeleteIdentifier(index: number): void {
    this.loadingService.setShowSpinner(true);
    const itemToDelete = this.identifiersFullObj[index];
    this.apiService
      .deleteEntity(EntityEndpointValue.IDENTIFIER, itemToDelete.instanceId!)
      .then(() => {
        const identifierArr = this.form.get('identifier') as FormArray;
        identifierArr.removeAt(index);
        this.identifiersFullObj.splice(index, 1);

        const updatingObject = this.entityExecutionService.getActiveSoftwareSourceCodeValue() || {};
        const newIdentifierArr = updatingObject.identifier?.splice(index, 1);
        this.softwareSourceCodeService.updateSoftwareSourceCodeRecord(updatingObject, {
          identifier: newIdentifierArr,
        });
        this.entityExecutionService.handleSoftwareSourceCodeSave();
        this.snackbarService.openSnackbar('Successfully deleted Identifier.', 'Close', SnackbarType.SUCCESS, 3000, [
          'snackbar',
          'mat-toolbar',
          'snackbar-success',
        ]);
      })
      .catch(() => {
        this.snackbarService.openSnackbar('Error deleting Identifier.', 'Close', SnackbarType.ERROR, 3000, [
          'snackbar',
          'mat-toolbar',
          'snackbar-error',
        ]);
      })
      .finally(() => this.loadingService.setShowSpinner(false));
  }

  public handleUpdateIdentifier(index: number): void {
    this.loadingService.setShowSpinner(true);
    const identifierToUpdate = this.identifiersFullObj[index];
    const identifierArr = this.form.get('identifier') as FormArray;
    identifierToUpdate.identifier = identifierArr.at(index).value.identifier;
    identifierToUpdate.type = identifierArr.at(index).value.type;

    this.apiService.endpoints.Identifier.update
      .call(identifierToUpdate)
      .then(() => {
        this.identifiersFullObj[index].identifier = identifierToUpdate.identifier;
        this.identifiersFullObj[index].type = identifierToUpdate.type;
        this.snackbarService.openSnackbar('Successfully saved Identifier.', 'Close', SnackbarType.SUCCESS, 3000, [
          'snackbar',
          'mat-toolbar',
          'snackbar-success',
        ]);
      })
      .catch(() => {
        this.snackbarService.openSnackbar('Error updating Identifier.', 'Close', SnackbarType.ERROR, 3000, [
          'snackbar',
          'mat-toolbar',
          'snackbar-error',
        ]);
      })
      .finally(() => {
        this.loadingService.setShowSpinner(false);
      });
  }

  public getControls(field: string) {
    return (this.form.get(field) as FormArray).controls;
  }
}
