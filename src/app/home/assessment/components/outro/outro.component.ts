import { Component, OnInit, Output, EventEmitter, OnDestroy } from '@angular/core';
import { trigger, style, animate, transition } from '@angular/animations';
import { TranslateService } from '@ngx-translate/core';
import { TextToSpeechService } from 'src/app/core/services/text-to-speech.service';
import { UserService } from 'src/app/core/services/user.service';
import { User } from 'src/app/core/models/user.model';

@Component({
  selector: 'app-outro',
  templateUrl: './outro.component.html',
  styleUrls: ['./outro.component.scss'],
  animations: [
    trigger('fade', [
      transition(':leave', [
        animate('500ms ease-out', style({
          opacity: 0
        }))
      ])
    ])
  ],
})
export class OutroComponent implements OnInit, OnDestroy {
  @Output() outroComplete = new EventEmitter<void>();

  public firstName = '';
  public isShown = true;

  private applauseSound: HTMLAudioElement;

  constructor(
    private translateService: TranslateService,
    private ttsService: TextToSpeechService,
    private userService: UserService,
  ) { }

  ngOnInit(): void {
    this.applauseSound = new Audio('/assets/audios/Applause.mp3');
    this.applauseSound.load();
    this.applauseSound.play();

    this.userService.currentUser.subscribe((user: User) => {
      this.firstName = user.first_name;
      const locale = user.language.code === 'ENG' ? 'en-US' : 'ar-XA';

      this.translateService.get('assessments.outro.plain', {
        name: this.firstName
      }).subscribe(async (text) => {
        await this.playOutroSpeech(locale, text);

        setTimeout(() => {
          this.isShown = false;

          setTimeout(() => {
            this.outroComplete.emit();
          }, 500);
        }, 5000);
      });
    });
  }

  ngOnDestroy() {
    this.applauseSound?.pause();
  }

  private async playOutroSpeech(locale: 'en-US' | 'ar-XA', text: string): Promise<any> {
    return this.ttsService.getSynthesizedSpeech(locale, text).toPromise().then((audioURL) => {
      if (!audioURL) {
        return Promise.resolve();
      }
      const audio = new Audio(audioURL);
      audio.load();
      return audio.play();
    })
    .catch(() => Promise.resolve());
  }
}
