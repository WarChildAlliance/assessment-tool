import { Directive, HostListener, Input, OnChanges } from '@angular/core';
import { from, fromEvent, Observable } from 'rxjs';

@Directive({
    selector: '[appAudioPlay]'
})
export class AudioPlayDirective implements OnChanges {
    private audio: HTMLAudioElement;
    private isPlaying: boolean;
    @Input() appAudioPlay: string;

    constructor() {
    }

    ngOnChanges(): void {
        this.audio = new Audio(this.appAudioPlay);
        this.isPlaying = false;
    }

    @HostListener('click', ['$event'])
    onClick(): void {
        // const playing = fromEvent(this.audio, 'ended');
        if (this.appAudioPlay){
            this.audio.load();
            this.audio.play();
        } else if (this.audio && !this.appAudioPlay) {
            this.audio.pause();
        }
    }

}
