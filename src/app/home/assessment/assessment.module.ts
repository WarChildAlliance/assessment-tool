import { NgModule } from '@angular/core';
import { SharedModule } from '../../shared/shared.module';
import { AssessmentRoutingModule } from './assessment-routing.module';
import { AssessmentComponent } from './assessment.component';
import { TopicsComponent } from './components/topics/topics.component';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FlowerComponent } from './components/flower/flower.component';


@NgModule({
    declarations: [
        AssessmentComponent,
        TopicsComponent,
        FlowerComponent,
    ],
    imports: [
        SharedModule,
        AssessmentRoutingModule,
        MatIconModule,
        MatCardModule,
        MatTooltipModule
    ]
})
export class AssessmentModule {
}
