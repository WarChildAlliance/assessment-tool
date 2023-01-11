import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProfileComponent } from './profile.component';
import { ProfileRoutingModule } from './profile-routing.module';
import { SharedModule } from 'src/app/shared/shared.module';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatGridListModule } from '@angular/material/grid-list';



@NgModule({
  declarations: [
    ProfileComponent
  ],
    imports: [
        CommonModule,
        ProfileRoutingModule,
        SharedModule,
        MatCardModule,
        MatIconModule,
        MatButtonModule,
        MatGridListModule
    ]
})
export class ProfileModule { }
