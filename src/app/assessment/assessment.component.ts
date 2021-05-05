import { Component, OnInit } from '@angular/core';
import { EMPTY } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { AnswerService } from '../core/services/answer.service';

@Component({
  selector: 'app-assessment',
  templateUrl: './assessment.component.html',
  styleUrls: ['./assessment.component.scss']
})
export class AssessmentComponent implements OnInit {

  constructor(
    private answerService: AnswerService
  ) { }

  ngOnInit(): void {
    console.log('init assessment');
    this.answerService.hasActiveSession().pipe(
      switchMap((hasActiveSession: boolean) => {
        console.log('hasActiveSession', hasActiveSession);
        if (!hasActiveSession) {
          return this.answerService.startSession();
        }
        return EMPTY;
      })
    ).subscribe();
  }

}
