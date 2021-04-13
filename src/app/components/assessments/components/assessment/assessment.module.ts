import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AssessmentComponent } from './assessment.component';
import { AssessmentsRoutingModule } from './assessment-routing.module';



@NgModule({
  declarations: [
    AssessmentComponent
  ],
  imports: [
    CommonModule,
    AssessmentsRoutingModule,
    FormsModule,
    ReactiveFormsModule,
  ]
})
export class AssessmentModule { }
