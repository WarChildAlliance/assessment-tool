import { NgModule } from '@angular/core';
import { SharedModule } from '../../shared/shared.module';
import { AssessmentRoutingModule } from './assessment-routing.module';
import { AssessmentComponent } from './assessment.component';
import { HeaderComponent } from './components/header/header.component';
import { TopicsComponent } from './components/topics/topics.component';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { BeeAssisstantComponent } from '../assessment/components/bee-assisstant/bee-assisstant.component';



@NgModule({
  declarations: [
    AssessmentComponent,
    HeaderComponent,
    TopicsComponent,
    BeeAssisstantComponent,
  ],
  imports: [
    SharedModule,
    AssessmentRoutingModule,
    MatIconModule,
    MatCardModule,
  ]
})
export class AssessmentModule { }
