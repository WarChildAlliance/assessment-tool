import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AssessmentComponent } from './assessment.component';
import { TopicModule } from './components/topic/topic.module';
import { AssessmentRoutingModule } from './assessment-routing.module';


@NgModule({
  declarations: [
    AssessmentComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    TopicModule,
    AssessmentRoutingModule
  ]
})
export class AssessmentModule { }
