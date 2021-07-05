import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HomeComponent } from './home.component';
import { AssessmentsComponent } from './components/assessments/assessments.component';
import { HomeRoutingModule } from './home-routing.module';
import { SharedModule } from '../shared/shared.module';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import {GuidedTourModule, GuidedTourService} from 'ngx-guided-tour';

@NgModule({
  declarations: [
    HomeComponent,
    AssessmentsComponent
  ],
  imports: [
    SharedModule,
    HomeRoutingModule,
    MatIconModule,
    MatCardModule,
    GuidedTourModule
  ],
  providers: [
    GuidedTourService
  ]
})
export class HomeModule { }
