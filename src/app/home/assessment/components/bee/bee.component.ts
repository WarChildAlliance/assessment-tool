import { Component, OnInit, Input, Output, EventEmitter, HostBinding } from '@angular/core';
import { DomSanitizer, SafeStyle } from '@angular/platform-browser';
import { Observable } from 'rxjs';

export enum BeeAction {
  STAY = 'bee-stay',
  MOVE = 'bee-move',
  PRAISE = 'bee-praise',
  LEAVE = 'bee-leave'
}
export interface BeeState {
  action: BeeAction;
  position?: {
    x: number;
    y: number;
  };
  orientation?: 'left' | 'right';
  honeypots?: number;
}
@Component({
  selector: 'app-topics-bee',
  templateUrl: './bee.component.html',
  styleUrls: ['./bee.component.scss'],
})
export class BeeComponent implements OnInit {
  @Input() instructions$: Observable<BeeState>;
  @Output() praiseEnded = new EventEmitter<void>();
  @Output() beeLeft = new EventEmitter<void>();

  public previousState: BeeState = null;
  public currentState: BeeState = null;

  private stateQueue: BeeState[] = [];
  private stateLoading = false;
  private animationPlaying = false;
  private praises = [
    'topics.completedTopic.praise.1',
    'topics.completedTopic.praise.2',
    'topics.completedTopic.praise.3'
  ];

  constructor(private sanitizer: DomSanitizer) {}

  @HostBinding('style')
  public get style(): SafeStyle {
    let positionVars = this.previousState?.position ?
      `--previous-x: ${this.previousState.position.x}px; --previous-y: ${this.previousState.position.y}px;` : '';
    positionVars += this.currentState?.position ?
      ` --x: ${this.currentState.position.x}px; --y: ${this.currentState.position.y}px;` : '';
    return this.sanitizer.bypassSecurityTrustStyle(positionVars);
  }

  public get praise(): string {
    return this.praises[Math.floor(Math.random() * (this.praises.length - 1))];
  }

  ngOnInit(): void {
    this.instructions$.subscribe((state: BeeState) => {
      this.stateQueue.push(state);
      if (!this.stateLoading && (!this.currentState || this.currentState.action === BeeAction.STAY)) {
        this.registerNextState();
      }
    });
  }

  public onAnimationEnd(): void {
    this.animationPlaying = false;
    if (this.currentState.action === BeeAction.PRAISE) { this.praiseEnded.emit(); }
    if (this.currentState.action === BeeAction.LEAVE) { this.beeLeft.emit(); }
    this.registerNextState();
  }

  private registerNextState(): void {
    if (this.animationPlaying) {
      return;
    }
    const nextState = this.stateQueue.shift();
    if (!nextState) {
      return;
    }
    this.stateLoading = true;
    // setTimeout used here to avoid change detection errors
    setTimeout(() => {
      this.previousState = this.currentState;
      this.currentState = nextState;
      this.stateLoading = false;

      if (this.currentState?.action === BeeAction.STAY) {
        setTimeout(() => this.registerNextState(), 1000);
        return;
      }
      this.animationPlaying = true;
    }, 0);
  }
}
