import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { AudioPlayDirective } from './directives/audio-play.directive';
import { HeaderComponent } from './components/header/header.component';
import { MatIconModule } from '@angular/material/icon';
import { GenericConfirmationDialogComponent } from './components/generic-confirmation-dialog/generic-confirmation-dialog.component';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { AssisstantComponent } from './components/assisstant/assisstant.component';
import { RouterModule } from '@angular/router';
import { MatGridListModule } from '@angular/material/grid-list';
import { BackNavigationComponent } from './components/back-navigation/back-navigation.component';
import { PrimaryBtnComponent } from './components/primary-btn/primary-btn.component';
import { SpinnerComponent } from './components/spinner/spinner.component';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@NgModule({
    declarations: [
        AudioPlayDirective,
        GenericConfirmationDialogComponent,
        HeaderComponent,
        AssisstantComponent,
        BackNavigationComponent,
        PrimaryBtnComponent,
        SpinnerComponent
    ],
    imports: [
        CommonModule,
        TranslateModule,
        MatIconModule,
        MatDialogModule,
        MatButtonModule,
        RouterModule,
        MatGridListModule,
        MatProgressSpinnerModule
    ],
    exports: [
        CommonModule,
        TranslateModule,
        AudioPlayDirective,
        HeaderComponent,
        SpinnerComponent,
        AssisstantComponent,
        BackNavigationComponent,
        PrimaryBtnComponent
    ]
})
export class SharedModule {
}
