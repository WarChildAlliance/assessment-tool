import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ServiceWorkerModule } from '@angular/service-worker';
import { environment } from '../environments/environment';
import { ComponentsComponent } from './components/components.component';
import { LoginComponent } from './components/login/login.component';
import { AssessmentsComponent } from './components/assessments/assessments.component';
import { AssessmentComponent } from './components/assessments/assessment/assessment.component';
import { TopicComponent } from './components/assessments/assessment/components/topic/topic.component';
import { QuestionComponent } from './components/assessments/assessment/components/topic/components/question/question.component';

@NgModule({
  declarations: [
    AppComponent,
    ComponentsComponent,
    LoginComponent,
    AssessmentsComponent,
    AssessmentComponent,
    TopicComponent,
    QuestionComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
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
