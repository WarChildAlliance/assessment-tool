import { NgModule } from '@angular/core';
import { SharedModule } from '../../shared/shared.module';
import { AssessmentRoutingModule } from './assessment-routing.module';
import { AssessmentComponent } from './assessment.component';
import { TopicsComponent } from './components/topics/topics.component';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';


@NgModule({
  declarations: [
    AssessmentComponent,
    TopicsComponent
  ],
  imports: [
    SharedModule,
    AssessmentRoutingModule,
    MatIconModule,
    MatCardModule,
  ]
})
export class AssessmentModule { }
