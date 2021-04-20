import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-assessment',
  templateUrl: './assessment.component.html',
  styleUrls: ['./assessment.component.css']
})
export class AssessmentComponent implements OnInit {


  dummyTopics = ['Algebra', 'Geometry', 'Statistics'];

  constructor() { }

  ngOnInit(): void {
  }

}
