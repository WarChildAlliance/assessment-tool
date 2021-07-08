import { AfterViewInit, Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Assessment } from 'src/app/core/models/assessment.model';
import { AssessmentService } from 'src/app/core/services/assessment.service';
import { TutorialService } from 'src/app/core/services/tutorial.service';
import { PageNames } from 'src/app/core/utils/constants';

@Component({
  selector: 'app-assessments',
  templateUrl: './assessments.component.html',
  styleUrls: ['./assessments.component.scss']
})
export class AssessmentsComponent implements OnInit, AfterViewInit{

  pageName = PageNames.assessment;
  assessments: Assessment[];

  constructor(
    private assessmentService: AssessmentService,
    private tutorialSerice: TutorialService
  ) { }

  ngOnInit(): void {
    this.assessmentService.getAssessments().subscribe(
      assessments => {
        this.assessments = assessments;
      }
    );
  }

  ngAfterViewInit(): void {
    this.tutorialSerice.currentPage.next(this.pageName);
  }
}
