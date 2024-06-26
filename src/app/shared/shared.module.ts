import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { AudioPlayDirective } from './directives/audio-play.directive';
import { HeaderComponent } from './components/header/header.component';
import { MatIconModule } from '@angular/material/icon';
import { GenericConfirmationDialogComponent } from './components/generic-confirmation-dialog/generic-confirmation-dialog.component';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { RouterModule } from '@angular/router';
import { MatGridListModule } from '@angular/material/grid-list';
import { BackNavigationComponent } from './components/back-navigation/back-navigation.component';
import { ActionBtnComponent } from './components/action-btn/action-btn.component';
import { SpinnerComponent } from './components/spinner/spinner.component';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TutorialDialogComponent } from './components/tutorial-dialog/tutorial-dialog.component';
import { SpriteAnimationComponent } from './components/animation/sprite-animation.component';
import { BallonComponent } from './components/ballon/ballon.component';

@NgModule({
    declarations: [
        AudioPlayDirective,
        GenericConfirmationDialogComponent,
        HeaderComponent,
        BackNavigationComponent,
        ActionBtnComponent,
        SpinnerComponent,
        TutorialDialogComponent,
        SpriteAnimationComponent,
        BallonComponent
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
        BackNavigationComponent,
        ActionBtnComponent,
        BallonComponent
    ]
})
export class SharedModule {
}
