import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class TextToSpeechService {

  constructor(private http: HttpClient) { }

  public getSynthesizedSpeech(locale: 'en-US' | 'ar-XA', text: string): Observable<string> {
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
    }).pipe(map((res: {audioContent: string}) => {
      return `data:audio/mp3;base64,${res.audioContent}`;
    }));
  }
}
