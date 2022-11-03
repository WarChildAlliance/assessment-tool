import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Observable, EMPTY } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class TextToSpeechService {

  constructor(private http: HttpClient) { }

  public getSynthesizedSpeech(locale: 'en-US' | 'ar-XA', text: string): Observable<string | never> {
    return this.http.post(`${environment.TTS_API_URL}?key=${environment.TTS_API_KEY}`, {
      input: {
        text
      },
      voice: {
        languageCode: locale,
        name: locale === 'en-US' ? 'en-US-Wavenet-H' : 'ar-XA-Wavenet-A',
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

  // export const HttpLoaderFactory = (http: HttpClient): TranslateHttpLoader => new TranslateHttpLoader(http, '/assets/i18n/', '.json');

}
