import { Directive, HostListener, Input, OnChanges } from '@angular/core';
import { from, fromEvent, Observable } from 'rxjs';

@Directive({
    selector: '[appAudioPlay]'
})
export class AudioPlayDirective implements OnChanges {
    @Input() appAudioPlay: string;

    private audio: HTMLAudioElement;

    constructor() {
    }

    @HostListener('click', ['$event'])

    ngOnChanges(): void {
        this.audio = new Audio(this.appAudioPlay);
    }

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
