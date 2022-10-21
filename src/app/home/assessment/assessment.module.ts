import { NgModule } from '@angular/core';
import { SharedModule } from '../../shared/shared.module';
import { AssessmentRoutingModule } from './assessment-routing.module';
import { AssessmentComponent } from './assessment.component';
import { TopicsComponent } from './components/topics/topics.component';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { OutroComponent } from './components/outro/outro.component';
import { FlowerComponent } from './components/flower/flower.component';


@NgModule({
    declarations: [
        AssessmentComponent,
        TopicsComponent,
        OutroComponent,
        FlowerComponent,
    ],
    imports: [
        SharedModule,
        AssessmentRoutingModule,
        MatIconModule,
        MatCardModule
    ]
})
export class AssessmentModule {
}
