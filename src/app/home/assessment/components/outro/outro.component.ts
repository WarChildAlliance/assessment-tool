import { Component, OnInit, Output, EventEmitter, OnDestroy } from '@angular/core';
import { trigger, style, animate, transition } from '@angular/animations';
import { UserService } from 'src/app/core/services/user.service';
import { User } from 'src/app/core/models/user.model';
import { once } from 'events';

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

  public isShown = true;

  private readonly quoteAudio = {
    eng: '/assets/audios/from-text/outro_eng.mp3',
    fre: '/assets/audios/from-text/outro_fre.mp3'
  };
  private applauseSound: HTMLAudioElement;

  constructor(private userService: UserService) { }

  ngOnInit(): void {
    this.applauseSound = new Audio('/assets/audios/Applause.mp3');
    this.applauseSound.load();
    this.applauseSound.play();
    this.userService.currentUser.subscribe(async (user: User) => {
      const currentLang = user.language.code.toLowerCase();
      await this.playAudio(this.quoteAudio[currentLang], 2000);
      setTimeout(() => {
        this.isShown = false;
        setTimeout(() => {
          this.outroComplete.emit();
        }, 500);
      }, 5000);
    });
  }

  ngOnDestroy() {
    this.applauseSound?.pause();
  }

  private timeout(ms: number): Promise<unknown> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private async playAudio(audioSrc: string, msFallbackTimeout: number): Promise<void> {
    if (!audioSrc) {
      await this.timeout(msFallbackTimeout);
      return;
    }
    const audio = new Audio(audioSrc);
    audio.load();
    audio.play();
    await once(audio, 'ended');
  }
}
