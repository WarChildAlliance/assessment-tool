import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AppRoutingModule } from './app-routing.module';
import { RouterModule } from '@angular/router';
import { AppComponent } from './app.component';
import { ServiceWorkerModule } from '@angular/service-worker';
import { environment } from '../environments/environment';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AuthModule } from './components/auth/auth.module';
import { AssessmentsModule } from './components/assessments/assessments.module';
import { CommonModule } from "@angular/common";
import { LoginModule } from './components/auth/login/login.module'; //TODO why necessary here? Not sufficient in child?
import { TopicModule } from './components/assessments/components/assessment/components/topic/topic.module';
import { AssessmentModule } from './components/assessments/components/assessment/assessment.module';
import { UserComponent } from './components/user/user.component';


@NgModule({
  declarations: [
    AppComponent,
    UserComponent,
  ],
  imports: [
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    AppRoutingModule,
    AuthModule,
    CommonModule,
    AssessmentsModule,
    AssessmentModule,
    LoginModule,
    TopicModule,
    ServiceWorkerModule.register('ngsw-worker.js', {
      enabled: environment.production,
      // Register the ServiceWorker as soon as the app is stable
      // or after 30 seconds (whichever comes first).
      registrationStrategy: 'registerWhenStable:30000'
    })
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
