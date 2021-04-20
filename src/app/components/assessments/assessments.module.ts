import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AssessmentsComponent } from './assessments.component';
import { AssessmentsRoutingModule } from './assessments-routing.module';


@NgModule({
  declarations: [
    AssessmentsComponent
  ],
  imports: [
    CommonModule,
    AssessmentsRoutingModule,
    FormsModule,
    ReactiveFormsModule,
  ]
})
export class AssessmentsModule { }
