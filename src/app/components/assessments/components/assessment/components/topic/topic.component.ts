import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-topic',
  templateUrl: './topic.component.html',
  styleUrls: ['./topic.component.css']
})
export class TopicComponent implements OnInit {

  public start: boolean = true;
  public currentQuestion: number;

  constructor() { }

  ngOnInit(): void {
    //Todo set current question as last question answered
  }

}
