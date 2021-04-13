import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ServiceWorkerModule } from '@angular/service-worker';
import { environment } from '../environments/environment';
/*
import { AuthComponent } from './components/auth/auth.component';
import { AssessmentsComponent } from './components/assessments/assessments.component';
import { AssessmentComponent } from './components/assessments/components/assessment/assessment.component';
import { TopicComponent } from './components/assessments/components/assessment/components/topic/topic.component';
import { QuestionComponent } from './components/assessments/components/assessment/components/topic/components/question/question.component';
*/
@NgModule({
  declarations: [
    AppComponent,
    /*AuthComponent,
    AssessmentsComponent,
    AssessmentComponent,
    TopicComponent,
    QuestionComponent*/
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
