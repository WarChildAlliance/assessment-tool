import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl } from '@angular/forms';
import { BehaviorSubject } from 'rxjs';
import { AnswerDomino } from 'src/app/core/models/answer.model';
import { QuestionDomino } from 'src/app/core/models/question.model';
import { AssisstantService } from 'src/app/core/services/assisstant.service';

@Component({
  selector: 'app-question-domino',
  templateUrl: './question-domino.component.html',
  styleUrls: ['./question-domino.component.scss']
})
export class QuestionDominoComponent implements OnInit {
  @Input() question: QuestionDomino;
  @Input() answer: AnswerDomino;
  @Input() displayCorrectAnswer: BehaviorSubject<boolean>;
  @Input() resetAnswer: BehaviorSubject<boolean>;
  @Input() isEvaluated: boolean;
  @Output() answerChange = new EventEmitter<{ answer: AnswerDomino, next: boolean }>();

  private readonly pageID = 'question-number-line-page';

  public valueForm = new FormControl(null);

  constructor(
    private assisstantService: AssisstantService,
  ) { }

  ngOnInit(): void {
    this.assisstantService.setPageID(this.pageID);

    // shuffle evaluated options
    if (this.isEvaluated) {
      this.question.options = this.question.options.map(question => ({
        question,
        sort: Math.random()
      })).sort((a, b) => a.sort - b.sort).map((value) => value.question);
    }

    this.valueForm.valueChanges.subscribe(value => {
      if (value) {
        if (!this.answer) {
          this.answer = {
            selected_domino: value.id,
            question: this.question.id,
            valid: this.isValid()
          };
        } else {
          this.answer.selected_domino = value.id;
          this.answer.valid = this.isValid();
        }
        this.answerChange.emit({ answer: this.answer, next: this.answer.valid });
      }
    });
  }

  public getDotColor(dotNumbers: number): string {
    const colors = [
      '#DD8D77', '#91B393', '#7BA7D8', '#F2B3CC', '#F1D26A', '#AB749F'
    ];
    return colors[dotNumbers - 1];
  }

  public getOptionBtnStyle(option: any): string {
    return (!!this.answer && this.answer.selected_domino === option.id && !option.valid ?
      'elevated-invalid--outline' : (this.displayCorrectAnswer.getValue() && option.valid) ?
        'elevated-valid--outline' : 'elevated-neutral--outline');
  }

  private isValid(): boolean {
    return this.valueForm.value?.valid;
  }
}