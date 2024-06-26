import {
  Component,
  OnDestroy,
  OnInit
} from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { User } from '../core/models/user.model';
import { UserService } from '../core/services/user.service';
import { LanguageService } from '../core/services/language.service';
import { once } from 'events';

@Component({
  selector: 'app-intro',
  templateUrl: './intro.component.html',
  styleUrls: ['./intro.component.scss'],
})
export class IntroComponent implements OnInit, OnDestroy {
  public onEnterAnimation = false;
  public onSecondBallon = false;
  public onBeeLeave = false;
  public userData: User;
  public direction = 'ltr';

  private quotes: Record<string, string>;
  private currentLang: string;
  private readonly quotesAudio = {
    hi: {
      eng: '/assets/audios/from-text/hi_eng.mp3',
      ara: '/assets/audios/from-text/hi_ara.mp3',
      fre: '/assets/audios/from-text/hi_fre.mp3'
    },
    enterBallon: {
      eng: '/assets/audios/from-text/intro-enterBallon_eng.mp3',
      ara: '/assets/audios/from-text/intro-enterBallon_ara.mp3',
      fre: '/assets/audios/from-text/intro-enterBallon_fre.mp3'
    },
    secondBallon: {
      eng: '/assets/audios/from-text/intro-secondBallon_eng.mp3',
      ara: '/assets/audios/from-text/intro-secondBallon_ara.mp3',
      fre: '/assets/audios/from-text/intro-secondBallon_fre.mp3'
    }
  };
  private introAudio: HTMLAudioElement;

  constructor(
    private userService: UserService,
    private router: Router,
    private languageService: LanguageService,
    public translate: TranslateService
  ) {}

  ngOnInit(): void {
    this.introAudio = new Audio('assets/audios/intro-music.mp3');
    this.introAudio.volume=0.2;
    this.introAudio.load();
    this.introAudio.play();
    this.languageService.getDirection().subscribe((direction) => {
      this.direction = direction.toLowerCase();
    });
    this.userService.currentUser.subscribe((userData) => {
      this.userData = userData;
      this.currentLang = this.userData.language.code.toLowerCase();
    });

    this.initAnimation();
  }


  ngOnDestroy(): void {
    this.introAudio.pause();
  }

  async initAnimation(): Promise<void> {
    await this.setQuotes();

    await this.runEnterAnimation();
    await this.runSecondSpeech();
    await this.runBeeLeaves();

    this.userService
      .updateUserNoCache({ id: this.userData.id, see_intro: false })
      .subscribe(() => {
        this.router.navigate(['/']);
      });
  }

  private timeout(ms: number): Promise<unknown> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private async runEnterAnimation(): Promise<void> {
    this.onEnterAnimation = true;
    await this.playAudio(this.quotesAudio.hi[this.currentLang], 500);
    await this.playAudio(this.quotesAudio.enterBallon[this.currentLang], 4500);
    this.onEnterAnimation = false;
  }

  private async runSecondSpeech(): Promise<void> {
    this.onSecondBallon = true;
    await this.playAudio(this.quotesAudio.secondBallon[this.currentLang], 4500);
    this.onSecondBallon = false;
  }

  private async runBeeLeaves(): Promise<void> {
    this.onBeeLeave = true;
  }

  private async setQuotes(): Promise<void> {
    this.quotes = await this.translate
      .get(['general.hi', 'intro.enterBallon', 'intro.secondBallon'])
      .toPromise();

    this.quotes = {
      ...this.quotes,
      'general.hi': this.quotes['general.hi'],
    };
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
