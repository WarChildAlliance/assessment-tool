import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl } from '@angular/forms';
import { BehaviorSubject } from 'rxjs';
import { AnswerSEL } from 'src/app/core/models/answer.model';
import { QuestionSEL } from 'src/app/core/models/question.model';
import { AssisstantService } from 'src/app/core/services/assisstant.service';

@Component({
  selector: 'app-question-sel',
  templateUrl: './question-sel.component.html',
  styleUrls: ['./question-sel.component.scss']
})
export class QuestionSelComponent implements OnInit {
  @Input() question: QuestionSEL;
  @Input() answer: AnswerSEL;
  @Input() displayCorrectAnswer: BehaviorSubject<boolean>;
  @Output() answerChange = new EventEmitter<AnswerSEL>();

  private readonly pageID = 'question-sel-page';

  public valueForm = new FormControl(null);
  public selOptions = [
    {id: 'NOT_REALLY', path: 'notReallyLikeMe'},
    {id: 'A_LITTLE', path: 'aLittleLikeMe'},
    {id: 'A_LOT', path: 'aLotLikeMe'}
  ];

  constructor(
    private assisstantService: AssisstantService,
  ) { }

  ngOnInit(): void {
    this.assisstantService.setPageID(this.pageID);

    this.valueForm.valueChanges.subscribe(value => {
      if (value) {
        if (!this.answer) {
          this.answer = {
            statement: value.id,
            question: this.question.id,
            // There is no right or wrong answer for SEL questions, they are not considered
            valid: false
          };
        } else {
          this.answer.statement = value.id;
        }

        this.answerChange.emit(this.answer);
      }
    });
  }
}