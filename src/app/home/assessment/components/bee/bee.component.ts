import { Component, OnInit, Input, HostBinding } from '@angular/core';
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
    x: number,
    y: number
  };
  orientation?: 'left' | 'right';
}
@Component({
  selector: 'app-topics-bee',
  templateUrl: './bee.component.html',
  styleUrls: ['./bee.component.scss']
})
export class BeeComponent implements OnInit {
  private stateQueue: BeeState[] = [];

  public previousState: BeeState;
  public currentState: BeeState;

  @Input() instructions$: Observable<BeeState>;

  @HostBinding('style')
  public get style(): SafeStyle {
    let positionVars = this.previousState?.position ?
      `--previous-x: ${this.previousState.position.x}px; --previous-y: ${this.previousState.position.y}px;` : '';
    positionVars += this.currentState?.position ?
      `--x: ${this.currentState.position.x}px; --y: ${this.currentState.position.y}px;` : '';
    return this.sanitizer.bypassSecurityTrustStyle(positionVars);
  }

  constructor(private sanitizer: DomSanitizer) { }

  ngOnInit(): void {
    this.instructions$.subscribe((state: BeeState) => {
      this.stateQueue.push(state);
      if (!this.currentState || this.currentState.action === BeeAction.STAY) {
        this.registerNextState();
      }
    });
  }

  public registerNextState(): void {
    const nextState = this.stateQueue.shift();
    if (!nextState) {
      return;
    }
    this.previousState = this.currentState;
    this.currentState = nextState;
    if (this.currentState?.action === BeeAction.STAY) {
      setTimeout(() => this.registerNextState(), 1000);
    }
  }
}
