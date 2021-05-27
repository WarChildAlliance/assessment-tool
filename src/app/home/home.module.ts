import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HomeComponent } from './home.component';
import { AssessmentsComponent } from './components/assessments/assessments.component';
import { HomeRoutingModule } from './home-routing.module';
import { SharedModule } from '../shared/shared.module';
import {MatCardModule} from '@angular/material/card';


@NgModule({
  declarations: [
    HomeComponent,
    AssessmentsComponent
  ],
  imports: [
    SharedModule,
    HomeRoutingModule,
    MatCardModule,
  ]
})
export class HomeModule { }
