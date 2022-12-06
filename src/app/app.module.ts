import { HttpClient, HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ServiceWorkerModule } from '@angular/service-worker';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { environment } from '../environments/environment';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HttpLoaderFactory } from './core/factories/http-loader-translate.factory';
import { httpInterceptorProviders } from './core/interceptors/index.interceptor';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { GuidedTourModule, GuidedTourService } from 'ngx-guided-tour';
import { MatDialogModule, MatDialog, MatDialogRef } from '@angular/material/dialog';


@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    GuidedTourModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient],
      }
    }),
    BrowserAnimationsModule,
    ServiceWorkerModule.register('ngsw-worker.js', {
      enabled: environment.production,
      registrationStrategy: 'registerImmediately'
    }),
    MatSnackBarModule,
    MatDialogModule
  ],
  providers: [
    httpInterceptorProviders,
    GuidedTourService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
