import { Directive, HostListener, Input, OnChanges } from '@angular/core';

@Directive({
    selector: '[appAudioPlay]'
})
export class AudioPlayDirective implements OnChanges {
    private audio: HTMLAudioElement;
    private playing: boolean;
    @Input() appAudioPlay: string;

    constructor() {
    }

    ngOnChanges(): void {
        this.audio = new Audio(this.appAudioPlay);
        this.playing = false;
    }

    @HostListener('click', ['$event'])
    onClick(): void {
        this.audio.load();
        this.audio.play();
    }

}
