import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { AudioPlayDirective } from './directives/audio-play.directive';
import { StudentPointsComponent } from './student-points/student-points.component';
import { MatIconModule } from '@angular/material/icon';



@NgModule({
  declarations: [
    AudioPlayDirective,
    StudentPointsComponent
  ],
  imports: [
    CommonModule,
    TranslateModule,
    MatIconModule
  ],
  exports: [
    CommonModule,
    TranslateModule,
    AudioPlayDirective,
    StudentPointsComponent
  ]
})
export class SharedModule { }
