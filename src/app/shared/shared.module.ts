import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { AudioPlayDirective } from './directives/audio-play.directive';
import { StudentPointsComponent } from './components/student-points/student-points.component';
import { MatIconModule } from '@angular/material/icon';
import { GenericConfirmationDialogComponent } from './components/generic-confirmation-dialog/generic-confirmation-dialog.component';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { BeeAssisstantComponent } from '../home/assessment/components/bee-assisstant/bee-assisstant.component';


@NgModule({
    declarations: [
        AudioPlayDirective,
        StudentPointsComponent,
        GenericConfirmationDialogComponent,
        BeeAssisstantComponent
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
        StudentPointsComponent,
        BeeAssisstantComponent
    ]
})
export class SharedModule {
}
