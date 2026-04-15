import { HTTP_INTERCEPTORS, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { APP_INITIALIZER, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ComponentsModule } from 'src/components/components.module';
import { AppRoutingModule } from './app-routing.module';
import { MatDialogRef } from '@angular/material/dialog';
import { MatSnackBarRef } from '@angular/material/snack-bar';
import { AppComponent } from './app.component';
import { SnackbarService } from 'src/services/snackbar.service';
import { DialogComponent } from 'src/components/dialogs/dialog/dialog.component';
import { PortalModule } from '@angular/cdk/portal';
import { ApiService } from 'src/apiAndObjects/api/api.service';
import { AngularMaterialModule } from './angular-material.module';
import { DialogService } from 'src/components/dialogs/dialog.service';
import { OAuthModule } from 'angular-oauth2-oidc';
import { AaaiService, aaaiServiceProvider } from 'src/aaai/aaai.service';
import { DateAdapter, MAT_DATE_LOCALE } from '@angular/material/core';
import { MomentDateAdapter, MAT_MOMENT_DATE_ADAPTER_OPTIONS } from '@angular/material-moment-adapter';
import { ErrorInterceptor } from 'src/interceptors/error.interceptor';
import { provideMomentDatetimeAdapter } from '@ng-matero/extensions-moment-adapter';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

const initializeAuthFactory = (aaaiService: AaaiService) => (): Promise<void> => aaaiService.initializeAuth();

@NgModule({
  declarations: [AppComponent, DialogComponent],
  bootstrap: [AppComponent],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    ComponentsModule,
    AppRoutingModule,
    PortalModule,
    AngularMaterialModule,
    OAuthModule.forRoot(),
    RouterLink,
    RouterLinkActive,
    RouterOutlet,
  ],
  providers: [
    {
      provide: MatDialogRef,
      useValue: {},
    },
    {
      provide: MatSnackBarRef,
      useValue: {},
    },
    ApiService,
    DialogService,
    SnackbarService,
    aaaiServiceProvider,
    {
      provide: APP_INITIALIZER,
      useFactory: initializeAuthFactory,
      deps: [AaaiService],
      multi: true,
    },
    provideMomentDatetimeAdapter({
      parse: {
        dateInput: 'YYYY-MM-DD',
        monthInput: 'MMMM',
        yearInput: 'YYYY',
        timeInput: 'HH:mm',
        datetimeInput: 'YYYY-MM-DD HH:mm',
      },
      display: {
        dateInput: 'YYYY-MM-DD',
        monthInput: 'MMMM',
        yearInput: 'YYYY',
        timeInput: 'HH:mm',
        datetimeInput: 'YYYY-MM-DD HH:mm',
        monthYearLabel: 'YYYY MMMM',
        dateA11yLabel: 'LL',
        monthYearA11yLabel: 'MMMM YYYY',
        popupHeaderDateLabel: 'MMM DD, ddd',
      },
    }),
    { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE, MAT_MOMENT_DATE_ADAPTER_OPTIONS] },
    { provide: MAT_MOMENT_DATE_ADAPTER_OPTIONS, useValue: { useUtc: true } },
    { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true },
    provideHttpClient(withInterceptorsFromDi()),
  ],
})
export class AppModule {
  // static forRoot(): ModuleWithProviders<AppModule> {
  //   return {
  //     ngModule: AppModule,
  //     providers: [aaaiServiceProvider],
  //   };
  // }
}
