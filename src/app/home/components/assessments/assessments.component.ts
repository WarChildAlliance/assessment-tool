import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-assessments',
  templateUrl: './assessments.component.html',
  styleUrls: ['./assessments.component.scss']
})
export class AssessmentsComponent implements OnInit {

  dummyData = ['math', 'literacy', 'other'];

  constructor(
    private router: Router
  ) { }

  ngOnInit(): void {
  }

}
