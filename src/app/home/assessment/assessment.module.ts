import { NgModule } from '@angular/core';
import { SharedModule } from '../../shared/shared.module';
import { AssessmentRoutingModule } from './assessment-routing.module';
import { AssessmentComponent } from './assessment.component';
import { TopicsComponent } from './components/topics/topics.component';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatTooltipModule } from '@angular/material/tooltip';


@NgModule({
    declarations: [
        AssessmentComponent,
        TopicsComponent,
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
