import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Observable, EMPTY, BehaviorSubject } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class TextToSpeechService {
  private readonly voices = {
    'en-GB': 'en-GB-Neural2-A',
    'ar-XA': 'ar-XA-Wavenet-D',
    'fr-FR': 'fr-FR-Neural2-A'
  };
  private readonly ttsAudioPlayingSource = new BehaviorSubject<boolean>(false);

  constructor(private http: HttpClient) { }

  public get ttsAudioPlaying$(): Observable<any> {
    return this.ttsAudioPlayingSource.asObservable();
  }
  public set ttsAudioPlaying(value: boolean) {
    this.ttsAudioPlayingSource.next(value);
  }

  public getSynthesizedSpeech(locale: 'en-GB' | 'ar-XA' | 'fr-FR', text: string): Observable<string | never> {
    return this.http.post(`${environment.TTS_API_URL}?key=${environment.TTS_API_KEY}`, {
      input: {
        text
      },
      voice: {
        languageCode: locale,
        name: this.voices[locale],
        ssmlGender: 'FEMALE'
      },
      audioConfig: {
        audioEncoding: 'MP3',
        speakingRate: .8,
        pitch: 2
      }
    }).pipe(
      map((res: {audioContent: string}) => `data:audio/mp3;base64,${res.audioContent}`),
      catchError(() => EMPTY)
    );
  }
}
