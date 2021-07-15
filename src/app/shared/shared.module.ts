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

@NgModule({
  declarations: [
    AudioPlayDirective,
    GenericConfirmationDialogComponent,
    HeaderComponent,
    AssisstantComponent
  ],
  imports: [
    CommonModule,
    TranslateModule,
    MatIconModule,
    MatDialogModule,
    MatButtonModule,
    RouterModule

  ],
  exports: [
    CommonModule,
    TranslateModule,
    AudioPlayDirective,
    HeaderComponent,
    AssisstantComponent
  ]
})
export class SharedModule {
}
