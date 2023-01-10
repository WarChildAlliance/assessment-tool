import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { AnswerCalcul } from 'src/app/core/models/answer.model';
import { QuestionCalcul } from 'src/app/core/models/question.model';

@Component({
  selector: 'app-question-calcul',
  templateUrl: './question-calcul.component.html',
  styleUrls: ['./question-calcul.component.scss']
})
export class QuestionCalculComponent implements OnInit {
  @Input() question: QuestionCalcul;
  @Input() answer: AnswerCalcul;
  @Input() displayCorrectAnswer: BehaviorSubject<boolean>;
  @Input() resetAnswer: BehaviorSubject<boolean>;
  @Input() isEvaluated: boolean;
  @Output() answerChange = new EventEmitter<{ answer: AnswerCalcul; next: boolean }>();

  public operatorSymbol: string;
  public answerNumber: number;
  public studentAnswer: number[];
  public numberIndex = 0;

  public operatorTypes = [
    { id: 'ADDITION', symbol: '+' },
    { id: 'SUBTRACTION', symbol: '-' },
    { id: 'DIVISION', symbol: '÷' },
    { id: 'MULTIPLICATION', symbol: '×' }
  ];

  private readonly pageID = 'question-calcul-page';

  constructor() { }

  ngOnInit(): void {

    const operator = this.operatorTypes.find(op => op.id === this.question.operator);
    this.operatorSymbol = operator?.symbol;
    if (operator.id === 'ADDITION') {
      this.answerNumber = this.question.first_value + this.question.second_value;
    } else if (operator.id === 'SUBTRACTION') {
      this.answerNumber = this.question.first_value - this.question.second_value;
    } else if (operator.id === 'DIVISION') {
      this.answerNumber = this.question.first_value / this.question.second_value;
    } else {
      this.answerNumber = this.question.first_value * this.question.second_value;
    }

    this.studentAnswer = new Array(this.answerNumber.toString().length);
  }

  public submitAnswer(): void {
    const studentNumber = parseInt(this.studentAnswer.join(''), 10);
    const valid = this.isValid(studentNumber);
    this.wrongAnswerVibration(valid);

    if (!this.answer) {
      this.answer = {
        value: studentNumber,
        question: this.question.id,
        attempt: valid,
        valid
      };
    } else {
      this.answer.attempt = valid;
    }
    this.answerChange.emit({ answer: this.answer, next: this.answer.attempt });
  }

  public enterKeyboard(value: any): void {
    if (value === 'enter') {
      this.submitAnswer();
    } else if (value === 'clear') {
      this.numberIndex -= this.numberIndex ? 1 : 0;
      this.studentAnswer[this.numberIndex] = undefined;
    } else if (this.numberIndex < this.studentAnswer.length) {
      this.studentAnswer[this.numberIndex] = value;
      this.numberIndex += 1;
    }
  }

  private isValid(studentNumber: number): boolean {
    return this.answerNumber === studentNumber;
  }

  private wrongAnswerVibration(valid: boolean): void {
    if (!valid) {
      const checkedOption = document.getElementById('studentAnswer') as HTMLLabelElement;
      checkedOption.classList.add('vibration');
      this.studentAnswer.fill(undefined);
      this.numberIndex = 0;

      setTimeout(() => {
        checkedOption.classList.remove('vibration');
      }, 500);
    }
  }
}
