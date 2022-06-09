import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { Observable, fromEvent } from 'rxjs';
import { take, map } from 'rxjs/operators';

@Component({
  selector: 'app-sprite-animation',
  templateUrl: './sprite-animation.component.html',
  styleUrls: ['./sprite-animation.component.scss']
})
export class SpriteAnimationComponent implements OnInit, OnDestroy {

  @Input() spritesheetURL: string;
  @Input() frameCount;
  @Input() loop: boolean = false;

  private spritesheetWidth = 0;
  private animateInterval: ReturnType<typeof setTimeout>;

  public pxFrameWidth = 0;
  public pxFrameHeight = 0;
  public backgroundPosX = 0;

  constructor() { }

  ngOnInit(): void {
    this.getImgDimensions(this.spritesheetURL).subscribe(dimensions => {
      this.spritesheetWidth = dimensions.width;
      this.pxFrameWidth = dimensions.width / this.frameCount;
      this.pxFrameHeight = dimensions.height;
      this.backgroundPosX = dimensions.width;
      this.animate();
    });
  }

  private getImgDimensions(imgURL: string): Observable<{width: number, height: number}> {
    const mapLoadedImage = (event) => {
      return {
          width: event.target.width,
          height: event.target.height
      };
    }
    let image = new Image();
    const $loadedImg = fromEvent(image, "load").pipe(take(1), map(mapLoadedImage));
    image.src = imgURL;
    return $loadedImg;
  }

  private animate() {
    this.animateInterval = setInterval(() => {
      if (this.loop && this.backgroundPosX === this.pxFrameWidth) {
        this.backgroundPosX = this.spritesheetWidth;
      } else if (this.backgroundPosX === this.pxFrameWidth) {
        clearInterval(this.animateInterval);
      } else {
        this.backgroundPosX -= this.pxFrameWidth;
      }
    }, 33);
  }

  ngOnDestroy(): void {
    if (this.loop) {
      clearInterval(this.animateInterval);
    }
  }
}
