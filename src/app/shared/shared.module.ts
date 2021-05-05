import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { AudioPlayDirective } from './directives/audio-play.directive';



@NgModule({
  declarations: [
    AudioPlayDirective
  ],
  imports: [
    CommonModule,
    TranslateModule
  ],
  exports: [
    CommonModule,
    TranslateModule,
    AudioPlayDirective
  ]
})
export class SharedModule { }
