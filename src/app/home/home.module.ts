import { NgModule } from '@angular/core';
import { HomeComponent } from './home.component';
import { AssessmentsComponent } from './components/assessments/assessments.component';
import { HomeRoutingModule } from './home-routing.module';
import { SharedModule } from '../shared/shared.module';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';

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
    ]
})
export class HomeModule {
}
