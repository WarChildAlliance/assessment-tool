import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Assessment } from 'src/app/core/models/assessment.model';
import { AssessmentService } from 'src/app/core/services/assessment.service';
import { AssisstantService } from 'src/app/core/services/assisstant.service';

@Component({
  selector: 'app-assessments',
  templateUrl: './assessments.component.html',
  styleUrls: ['./assessments.component.scss']
})
export class AssessmentsComponent implements OnInit {

  assessments: Assessment[];
  private readonly pageID = 'assessments-page';

  constructor(
    private assessmentService: AssessmentService,
    private assisstantService: AssisstantService,
  ) { }

  ngOnInit(): void {
    this.assessmentService.getAssessments().subscribe(
      assessments => {
        this.assessments = assessments;
      }
    );
    this.assisstantService.setPageID(this.pageID);
  }

}
