import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { AudioPlayDirective } from './directives/audio-play.directive';
import { StudentPointsComponent } from './components/student-points/student-points.component';
import { MatIconModule } from '@angular/material/icon';
import { GenericConfirmationDialogComponent } from './components/generic-confirmation-dialog/generic-confirmation-dialog.component';
import { MatDialogModule } from "@angular/material/dialog";
import { MatButtonModule } from "@angular/material/button";



@NgModule({
  declarations: [
    AudioPlayDirective,
    StudentPointsComponent,
    GenericConfirmationDialogComponent
  ],
  imports: [
    CommonModule,
    TranslateModule,
    MatIconModule,
    MatDialogModule,
    MatButtonModule
  ],
  exports: [
    CommonModule,
    TranslateModule,
    AudioPlayDirective,
    StudentPointsComponent
  ]
})
export class SharedModule { }
