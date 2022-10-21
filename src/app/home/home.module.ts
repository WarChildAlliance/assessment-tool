import { NgModule } from '@angular/core';
import { HomeComponent } from './home.component';
import { AssessmentsComponent } from './components/assessments/assessments.component';
import { HomeRoutingModule } from './home-routing.module';
import { SharedModule } from '../shared/shared.module';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';

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
        MatButtonModule,
        MatTooltipModule
    ]
})
export class HomeModule {
}
