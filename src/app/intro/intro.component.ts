import {
  Component,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { User } from '../core/models/user.model';
import { TextToSpeechService } from '../core/services/text-to-speech.service';
import { UserService } from '../core/services/user.service';

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
  private userSubscription: Subscription = new Subscription();
  private quotes: Record<string, string>;

  constructor(
    private userService: UserService,
    private router: Router,
    private ttsService: TextToSpeechService,
    public translate: TranslateService
  ) {}

  ngOnInit(): void {
    this.userSubscription = this.userService
      .getUser()
      .subscribe(async (userData) => {
        this.userData = userData;
      });
  }

  async init(): Promise<void> {
    await this.setQuotes(this.userData);

    await this.runEnterAnimation();
    await this.runSecondSpeech();
    await this.runBeeLeaves();

    this.userService
      .updateUserNoCache({ id: this.userData.id, see_intro: false })
      .subscribe(() => {
        this.router.navigate(['/']);
      });
  }

  ngOnDestroy(): void {
    this.userSubscription.unsubscribe();
  }

  timeout(ms: number): Promise<unknown> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async runEnterAnimation(): Promise<void> {
    this.onEnterAnimation = true;
    await this.playAudio(this.quotes['general.hi']);
    await this.timeout(500);
    await this.playAudio(this.quotes['intro.enterBallon']);
    await this.timeout(4500);
    this.onEnterAnimation = false;
  }

  async runSecondSpeech(): Promise<void> {
    this.onSecondBallon = true;
    await this.playAudio(this.quotes['intro.secondBallon']);
    await this.timeout(4500);
    this.onSecondBallon = false;
  }

  async runBeeLeaves(): Promise<void> {
    this.onBeeLeave = true;
  }

  async setQuotes(userData: User): Promise<void> {
    this.quotes = await this.translate
      .get(['general.hi', 'intro.enterBallon', 'intro.secondBallon'])
      .toPromise();

    this.quotes = {
      ...this.quotes,
      'general.hi': this.quotes['general.hi'].replace(
        '{{name}}',
        userData.first_name
      ),
    };
  }

  async playAudio(quote: string): Promise<void> {
    const audioURL = await this.ttsService
      .getSynthesizedSpeech(
        this.userData.language.code === 'ENG' ? 'en-US' : 'ar-XA',
        quote
      )
      .toPromise();
    if (!audioURL) {
      return;
    }
    const titleAudio = new Audio(audioURL);
    titleAudio.load();
    await titleAudio.play();
  }
}
