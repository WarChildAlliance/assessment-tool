import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-ballon',
  templateUrl: './ballon.component.html',
  styleUrls: ['./ballon.component.scss'],
})
export class BallonComponent implements OnInit {
  @Input() placement: 'left' | 'right' = 'left';
  @Input() iconXPosition = 0;
  @Input() iconYPosition = 0;
  constructor() {}

  ngOnInit(): void {}
}
