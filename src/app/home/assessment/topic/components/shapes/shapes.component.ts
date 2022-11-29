import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';

@Component({
  selector: 'app-shapes',
  templateUrl: './shapes.component.html',
  styleUrls: ['./shapes.component.scss']
})
export class ShapesComponent implements OnInit, OnChanges {
  @Input() shape: string;
  @Input() style: string;
  @Input() quantity: number;

  // Default color is red
  public color = '#CC0E2F';
  private colors = [
    { name: 'RED', hex: '#CC0E2F' },
    { name: 'LIGHT_GREEN', hex: '#33AC7D' },
    { name: 'DARK_GREEN', hex: '#25983C' },
    { name: 'YELLOW', hex: '#F89F04' },
    { name: 'ORANGE', hex: '#EC6F1B' },
    { name: 'LIGHT_BLUE', hex: '#00A3DA' },
    { name: 'DARK_BLUE', hex: '#524897' },
    { name: 'PINK', hex: '#E24BAE' },
    { name: 'PURPLE', hex: '#8D6B91' }
  ];

  constructor() { }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.style && changes.style.previousValue !== changes.style.currentValue) {
      this.color = this.colors.find(color => color.name === changes.style.currentValue)?.hex ?? '#CC0E2F';
    }
  }

  ngOnInit(): void {
  }

}
