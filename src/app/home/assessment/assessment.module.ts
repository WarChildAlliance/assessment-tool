import { NgModule } from '@angular/core';
import { SharedModule } from '../../shared/shared.module';
import { AssessmentRoutingModule } from './assessment-routing.module';
import { AssessmentComponent } from './assessment.component';
import { QuestionSetsComponent } from './components/question-sets/question-sets.component';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { OutroComponent } from './components/outro/outro.component';
import { FlowerComponent } from './components/flower/flower.component';
import { BeeComponent } from './components/bee/bee.component';
import { NgxUsefulSwiperModule } from 'ngx-useful-swiper';


@NgModule({
    declarations: [
        AssessmentComponent,
        QuestionSetsComponent,
        OutroComponent,
        FlowerComponent,
        BeeComponent,
    ],
    imports: [
        SharedModule,
        AssessmentRoutingModule,
        MatIconModule,
        MatCardModule,
        NgxUsefulSwiperModule
    ]
})
export class AssessmentModule {
}
