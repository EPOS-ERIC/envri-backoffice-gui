/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, Input, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, UntypedFormControl, Validators } from '@angular/forms';
import {
  DataProduct,
  Distribution,
  LinkedEntity,
  Organization,
  RoutesDistributionInfo,
  RoutesPluginWithRelationDetails,
  WebService,
} from 'generated/backofficeSchemas';
import { debounceTime } from 'rxjs';
import { ApiService } from 'src/apiAndObjects/api/api.service';
import { WithSubscription } from 'src/helpers/subscription';
import { DialogService } from 'src/components/dialogs/dialog.service';
import { EntityExecutionService } from 'src/services/calls/entity-execution.service';
import { HelpersService } from 'src/services/helpers.service';
import { LoadingService } from 'src/services/loading.service';
import { SnackbarService, SnackbarType } from 'src/services/snackbar.service';
import { Entity } from 'src/utility/enums/entity.enum';
import { Status } from 'src/utility/enums/status.enum';
import { ActiveUserService } from 'src/services/activeUser.service';

@Component({
  selector: 'app-distribution-webservice',
  templateUrl: './webservice.component.html',
  styleUrl: './webservice.component.scss',
})
export class DistributionWebserviceComponent extends WithSubscription implements OnInit {
  @Input() accessService!: Distribution['accessService'];
  @Input() supportedOperations: WebService['supportedOperation'];
  @Input() distribution!: Distribution;
  @Input() distributionIndex!: number;

  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly helpersService: HelpersService,
    private readonly apiService: ApiService,
    private readonly dialogService: DialogService,
    private readonly entityExecutionService: EntityExecutionService,
    private readonly loadingService: LoadingService,
    private readonly snackbarService: SnackbarService,
    private readonly activeUserService: ActiveUserService,
  ) {
    super();
  }

  public form!: FormGroup;

  public webservice!: WebService | null;

  public floatLabelControl = new UntypedFormControl('auto');

  public serviceProviders: Array<Organization> = [];

  public serviceProvidersLoading = false;

  public selectedServiceProvider: Organization | undefined;

  public dataProduct!: DataProduct | null;

  public disabled = true;

  public plugins: RoutesPluginWithRelationDetails[] = [];

  public pluginsLoading = false;

  public pluginRequestForm!: FormGroup;

  public readonly pluginRequestTypes: Array<{ value: string; label: string }> = [
    { value: 'create_new', label: 'Create New' },
    { value: 'update_existing', label: 'Update existing' },
    { value: 'other', label: 'Other' },
  ];

  public pluginRequestSending = false;

  private loadedPluginsKey = '';

  private initData(details: LinkedEntity): void {
    this.loadingService.setShowSpinner(true);
    this.apiService.endpoints[Entity.WEBSERVICE].get
      .call(
        {
          metaId: details.metaId as string,
          instanceId: details.instanceId as string,
        },
        false,
      )
      .then((data: Array<WebService>) => {
        if (Array.isArray(data) && data.length > 0) {
          this.webservice = data.shift() as WebService;

          if (this.webservice) {
            this.entityExecutionService.setActiveWebService(
              this.entityExecutionService.convertToWebService(this.webservice),
            );
            this.handleServiceProviders(this.webservice);
            this.initForm();
            let userHasEditPermissionsForSubmitted: boolean | undefined = false;
            // check for User Role - if user not an ADMIN or REVIEWER can see the SUBMITTED, but can't edit them
            const activeUser = this.activeUserService.getActiveUser();
            if(activeUser){
              const activeUserGroups = activeUser.groups;
              if(activeUserGroups){
                // find group in UserGroups matching with current active loaded Entity
                const groupMatch = activeUserGroups.find(group => group.groupId === this.dataProduct?.groups?.find(entityGroup => entityGroup === group.groupId));
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
            if ((this.dataProduct?.status === Status.SUBMITTED && !userHasEditPermissionsForSubmitted) || this.dataProduct?.status === Status.PUBLISHED || this.dataProduct?.status === Status.ARCHIVED) {
              this.form.disable();
              this.disabled = true;
            } else {
              this.disabled = false;
            }
            this.syncPluginRequestFormState();
            this.fetchPluginsForDistribution();
          }
        }
      })
      .catch(() => {
        this.webservice = {};
      })
      .finally(() => this.loadingService.setShowSpinner(false));
  }

  private initSubscriptions(): void {
    this.subscribe(this.entityExecutionService.dataProductObs, (dataProduct: DataProduct | null) => {
      this.dataProduct = dataProduct;
    });
  }

  private trackFormData(): void {
    if (this.dataProduct) {
      const updatingObject = this.entityExecutionService.getActiveWebServiceValue();
      this.form.valueChanges.pipe(debounceTime(500)).subscribe((changes) => {
        if (null != updatingObject) {
          updatingObject.name = changes.name;
          updatingObject.description = changes.description;
          this.entityExecutionService.setActiveWebService(updatingObject);
        }
      });
    }
  }

  private initForm(): void {
    this.form = this.formBuilder.group({
      name: new FormControl(this.webservice?.name),
      description: new FormControl(this.webservice?.description),
      documentation: new FormControl(this.webservice?.documentation, [
        Validators.required,
        (control: AbstractControl): { [key: string]: any } | null => {
          if (this.helpersService.isValidHttpUrl(control.value)) {
            return null;
          } else {
            control.markAsTouched();
            return { 'error-class': control.value };
          }
        },
      ]),
    });
    this.initPluginRequestForm();
    this.trackFormData();
  }

  private initPluginRequestForm(): void {
    this.pluginRequestForm = this.formBuilder.group({
      requestType: new FormControl(this.pluginRequestTypes[0].value, [Validators.required]),
      selectedPlugins: new FormControl([]),
      inputType: new FormControl([]),
      message: new FormControl('', [Validators.required]),
    });

    const requestTypeCtrl = this.pluginRequestForm.get('requestType');
    const selectedPluginsCtrl = this.pluginRequestForm.get('selectedPlugins');
    if (requestTypeCtrl && selectedPluginsCtrl) {
      this.subscribe(requestTypeCtrl.valueChanges, (requestType: string) => {
        if (requestType === 'update_existing') {
          selectedPluginsCtrl.setValidators([Validators.required]);
        } else {
          selectedPluginsCtrl.clearValidators();
          selectedPluginsCtrl.setValue([], { emitEvent: false });
        }

        selectedPluginsCtrl.updateValueAndValidity({ emitEvent: false });
      });
    }

    this.syncPluginRequestFormState();
  }

  private syncPluginRequestFormState(): void {
    if (!this.pluginRequestForm) {
      return;
    }

    if (this.form?.disabled) {
      this.pluginRequestForm.disable({ emitEvent: false });
      return;
    }

    this.pluginRequestForm.enable({ emitEvent: false });
  }

  private fetchPluginsForDistribution(): void {
    if (!this.distribution?.metaId || !this.distribution?.instanceId) {
      this.plugins = [];
      return;
    }

    const currentKey = `${this.distribution.metaId}|${this.distribution.instanceId}`;
    if (this.loadedPluginsKey === currentKey) {
      return;
    }

    this.pluginsLoading = true;
    this.apiService.endpoints.DistributionPlugin.getAll
      .call({
        metaId: this.distribution.metaId,
        instanceId: this.distribution.instanceId,
      })
      .then((distributionPluginInfo: RoutesDistributionInfo[]) => {
        this.plugins = distributionPluginInfo?.[0]?.relations ?? [];
        this.loadedPluginsKey = currentKey;
      })
      .catch(() => {
        this.plugins = [];
      })
      .finally(() => {
        this.pluginsLoading = false;
      });
  }

  public ngOnInit(): void {
    this.initSubscriptions();
    this.initData({
      instanceId: this.accessService![0].instanceId,
      metaId: this.accessService![0].metaId,
    });
  }

  public compareWithFn(optionOne: any, optionTwo: any): boolean {
    if (optionOne && optionTwo) {
      if (optionOne.metaId === optionTwo.metaId) {
        return true;
      }
      return false;
    }
    return false;
  }

  public handleUpdateServicePoint(): void {
    const webservice = this.entityExecutionService.getActiveWebServiceValue();
    if (webservice != null && this.selectedServiceProvider != null) {
      const serviceProviderEntityDetail: LinkedEntity = {
        entityType: Entity.ORGANIZATION,
        instanceId: this.selectedServiceProvider.instanceId,
        uid: this.selectedServiceProvider.uid,
        metaId: this.selectedServiceProvider.metaId,
      };
      webservice.provider = serviceProviderEntityDetail;
      this.entityExecutionService.setActiveWebService(webservice);
    }
  }

  private handleServiceProviders(webservice: WebService): void {
    if (this.serviceProviders.length === 0) {
      this.serviceProvidersLoading = true;
      this.apiService.endpoints.Organization.getAll.call().then((response: Organization[]) => {
        if (null != webservice.provider) {
          this.selectedServiceProvider = response.find((value: Organization) => value.uid === webservice.provider!.uid);
        }
        this.serviceProviders = response;
        this.serviceProvidersLoading = false;
      });
    }
  }

  public getPluginLabel(plugin: RoutesPluginWithRelationDetails, index: number): string {
    const name = plugin?.plugin?.name;
    if (name && name.trim().length > 0) {
      return name;
    }

    return `Plugin ${index + 1}`;
  }

  public getPluginName(plugin: RoutesPluginWithRelationDetails, index: number): string {
    return this.getPluginLabel(plugin, index);
  }

  public getPluginDescription(plugin: RoutesPluginWithRelationDetails): string {
    return this.formatPluginValue(plugin?.plugin?.description);
  }

  public getPluginInputFormat(plugin: RoutesPluginWithRelationDetails): string {
    return this.formatPluginValue(plugin?.relation?.input_format);
  }

  public getPluginOutputFormat(plugin: RoutesPluginWithRelationDetails): string {
    return this.formatPluginValue(plugin?.relation?.output_format);
  }

  private formatPluginValue(value?: string): string {
    if (typeof value === 'string' && value.trim().length > 0) {
      return value;
    }

    return '-';
  }

  public handleSendPluginRequest(): void {
    if (this.pluginRequestForm.invalid || this.pluginRequestSending) {
      return;
    }

    if (!this.distribution?.metaId || !this.distribution?.instanceId) {
      return;
    }

    this.pluginRequestSending = true;
    const { requestType, selectedPlugins, inputType, message } = this.pluginRequestForm.getRawValue();
    const requestTypeLabel = this.getRequestTypeLabel(requestType);
    const pluginsForUpdate = Array.isArray(selectedPlugins)
      ? (selectedPlugins as RoutesPluginWithRelationDetails[])
      : [];
    const messagePayload = this.buildPluginRequestMessage(message, requestTypeLabel, pluginsForUpdate, inputType);

    this.apiService.endpoints.DistributionPlugin.sendEmail
      .call({
        metaId: this.distribution.metaId,
        instanceId: this.distribution.instanceId,
        message: messagePayload,
      })
      .then(() => {
        this.pluginRequestForm.reset({
          requestType: this.pluginRequestTypes[0].value,
          selectedPlugins: [],
          inputType: [],
          message: '',
        });
        this.snackbarService.openSnackbar(`Plugin request sent.`, 'close', SnackbarType.SUCCESS, 3000, [
          'snackbar',
          'mat-toolbar',
          'snackbar-success',
        ]);
      })
      .catch(() => {
        this.snackbarService.openSnackbar(`Failed to send plugin request.`, 'close', SnackbarType.ERROR, 3000, [
          'snackbar',
          'mat-toolbar',
          'snackbar-error',
        ]);
      })
      .finally(() => {
        this.pluginRequestSending = false;
      });
  }

  public isUpdateExistingRequest(): boolean {
    return this.pluginRequestForm?.get('requestType')?.value === 'update_existing';
  }

  public getPluginSelectionLabel(plugin: RoutesPluginWithRelationDetails, index: number): string {
    return this.getPluginName(plugin, index);
  }

  private getRequestTypeLabel(requestType: string): string {
    return this.pluginRequestTypes.find((type) => type.value === requestType)?.label || 'Other';
  }

  private buildPluginRequestMessage(
    message: string,
    requestTypeLabel: string,
    selectedPlugins: RoutesPluginWithRelationDetails[],
    inputType?: string | string[],
  ): string {
    const lines: string[] = [`RequestType:[${requestTypeLabel}]`, `CurrentUrl:[${window.location.href}]`];

    if (requestTypeLabel === 'Update existing' && selectedPlugins.length > 0) {
      lines.push(`EditRequestFor:${JSON.stringify(this.buildSelectedPluginsPayload(selectedPlugins))}`);
    }

    const inputTypes = this.normalizeInputTypes(inputType);
    if (inputTypes.length > 0) {
      lines.push(`VisualizationOn:[${inputTypes.join(', ')}]`);
    }

    lines.push('', message);
    return lines.join('\n');
  }

  private buildSelectedPluginsPayload(
    selectedPlugins: RoutesPluginWithRelationDetails[],
  ): Array<Record<string, unknown>> {
    return selectedPlugins.map((selectedPlugin: RoutesPluginWithRelationDetails) => {
      const plugin = selectedPlugin.plugin;
      return {
        arguments: plugin?.arguments,
        description: plugin?.description,
        enabled: plugin?.enabled,
        executable: plugin?.executable,
        id: plugin?.id,
        installed: plugin?.installed,
        name: plugin?.name,
        repository: plugin?.repository,
        runtime: plugin?.runtime,
        version: plugin?.version,
        version_type: plugin?.version_type,
      };
    });
  }

  private normalizeInputTypes(inputType?: string | string[]): string[] {
    if (Array.isArray(inputType)) {
      return inputType.map((value: string) => value?.trim()).filter((value: string) => value.length > 0);
    }

    if (typeof inputType === 'string' && inputType.trim().length > 0) {
      return [inputType.trim()];
    }

    return [];
  }

  public handleRemovePlugins(): void {
    if (!this.distribution?.metaId || !this.distribution?.instanceId || this.form?.disabled) {
      return;
    }

    this.dialogService
      .openConfirmationDialog('Remove all plugins associated with this distribution?', false, 'warn')
      .then((confirmed: boolean) => {
        if (!confirmed) {
          return;
        }

        this.loadingService.setShowSpinner(true);
        this.apiService.endpoints.DistributionPlugin.remove
          .call({
            metaId: this.distribution.metaId as string,
            instanceId: this.distribution.instanceId as string,
          })
          .then(() => {
            this.plugins = [];
            this.loadedPluginsKey = `${this.distribution.metaId}|${this.distribution.instanceId}`;
            this.snackbarService.openSnackbar(`Plugins removed successfully.`, 'close', SnackbarType.SUCCESS, 3000, [
              'snackbar',
              'mat-toolbar',
              'snackbar-success',
            ]);
          })
          .catch(() => {
            this.snackbarService.openSnackbar(`Failed to remove plugins.`, 'close', SnackbarType.ERROR, 3000, [
              'snackbar',
              'mat-toolbar',
              'snackbar-error',
            ]);
          })
          .finally(() => {
            this.loadingService.setShowSpinner(false);
          });
      });
  }
}
