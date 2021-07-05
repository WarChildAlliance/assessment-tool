import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Assessment } from 'src/app/core/models/assessment.model';
import { AssessmentService } from 'src/app/core/services/assessment.service';
import { GuidedTour, GuidedTourService, Orientation, OrientationConfiguration, TourStep } from 'ngx-guided-tour';

@Component({
  selector: 'app-assessments',
  templateUrl: './assessments.component.html',
  styleUrls: ['./assessments.component.scss']
})
export class AssessmentsComponent implements OnInit {

  assessments: Assessment[];

  constructor(
    private assessmentService: AssessmentService,
    private guidedTourService: GuidedTourService
  ) { }

  ngOnInit(): void {
    this.assessmentService.getAssessments().subscribe(
      assessments => {
        this.assessments = assessments;
      }
    );

    this.defineTour();
  }

  defineTour(): void {

    const step0: TourStep = {
      content: 'welcome to the tour of the accessment tool',
    };

    const step1: TourStep = {
      selector: '#beeLogo',
      content: 'Here you can access your profile',
      orientation: Orientation.Bottom
    };

    const step2: TourStep = {
      selector: 'ul',
      content: 'Click here to go to an assessment',
      orientation: Orientation.Bottom
    };

    const tour: GuidedTour = {
      tourId: 'testTour',
      useOrb: false,
      steps: [step0, step1, step2],
    };

    this.guidedTourService.startTour(tour);
  }

}
