import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { BehaviorSubject } from 'rxjs';
import { AnswerCustomizedDragAndDrop } from 'src/app/core/models/answer.model';
import { QuestionCustomizedDragAndDrop } from 'src/app/core/models/question.model';

@Component({
  selector: 'app-question-customized-drag-and-drop',
  templateUrl: './question-customized-drag-and-drop.component.html',
  styleUrls: ['./question-customized-drag-and-drop.component.scss']
})
export class QuestionCustomizedDragAndDropComponent implements OnInit {
  @Input() question: QuestionCustomizedDragAndDrop;
  @Input() answer: AnswerCustomizedDragAndDrop;
  @Input() displayCorrectAnswer: BehaviorSubject<boolean>;
  @Input() resetAnswer: BehaviorSubject<boolean>;
  @Output() answerChange = new EventEmitter<{
    answer: AnswerCustomizedDragAndDrop; next: boolean; answerAnimationPosition: {x: number; y: number};
  }>();

  public draggableNumbers = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
  public studentAnswer: number[];
  public studentFirstValue: number[];
  public studentSecondValue: number[];
  public dropPosition: {x: number; y: number};

  public operatorSymbol: string;
  public operatorTypes = [
    { id: 'ADDITION', symbol: '+' },
    { id: 'SUBTRACTION', symbol: '-' },
    { id: 'DIVISION', symbol: '÷' },
    { id: 'MULTIPLICATION', symbol: '×' }
  ];

  public valueForm: FormGroup = new FormGroup({
    first_value: new FormArray([]),
    second_value: new FormArray([]),
    final_value: new FormArray([])
  });

  public firstColor: string;
  public secondColor: string;
  private colors = [
    { name: 'RED', hex: '#CC0E2F' },
    { name: 'LIGHT_GREEN', hex: '#33AC7D' },
    { name: 'DARK_GREEN', hex: '#25983C' },
    { name: 'YELLOW', hex: '#F89F04' },
    { name: 'ORANGE', hex: '#EC6F1B' },
    { name: 'LIGHT_BLUE', hex: '#00A3DA' },
    { name: 'DARK_BLUE', hex: '#524897' },
    { name: 'PINK', hex: '#E24BAE' },
    { name: 'PURPLE', hex: '#8D6B91' }
  ];

  private answerNumber: number;

  private readonly pageID = 'question-customized-drag-and-drop';

  constructor(
    public translate: TranslateService,
    private formBuilder: FormBuilder
  ) { }

  ngOnInit(): void {
    this.setOperator();
    this.setColors();

    this.resetAnswer.subscribe((value: boolean) => {
      if (value) {
        this.valueForm.reset();
        this.wrongAnswerVibration();
      }
    });

    this.valueForm.valueChanges.subscribe(value => {
      const finalValue = (this.valueForm.controls.final_value as FormArray).controls.every(
        (control: any) => control.controls.digit.value !== null
      );

      const firstValue = (this.valueForm.controls.first_value as FormArray).controls.every(
        (control: any) => control.controls.digit.value !== null
      );

      const secondValue = (this.valueForm.controls.second_value as FormArray).controls.every(
        (control: any) => control.controls.digit.value !== null
      );

      if (firstValue && secondValue && finalValue) {
        this.submitAnswer();
      }
    });
  }

  private setAnswerFormArray(formArray: string): void {
    const formGroup: FormGroup = this.formBuilder.group({
      digit: this.formBuilder.control(null)
    });
    (this.valueForm.get(formArray) as FormArray).push(formGroup);
  }

  private getStudentAnswer(formArray: string): number {
    let value = '';
     (this.valueForm.get(formArray) as FormArray).controls.forEach((control: any) => {
      value += control.controls.digit.value !== null ? control.controls.digit.value: '';
    });
    return Number(value);
  }

  private isValid(): boolean {
    return this.answerNumber === this.getStudentAnswer('final_value')
      && this.getStudentAnswer('first_value') === this.question.first_value
      && this.getStudentAnswer('second_value') === this.question.second_value;
  }

  private setOperator(): void {
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
    this.studentAnswer = Array.from(String(this.answerNumber), value => Number(value));
    this.studentFirstValue = Array.from(String(this.question.first_value), value => Number(value));
    this.studentSecondValue = Array.from(String(this.question.second_value), value => Number(value));

    this.studentAnswer.forEach(() => this.setAnswerFormArray('final_value'));
    this.studentFirstValue.forEach(() => this.setAnswerFormArray('first_value'));
    this.studentSecondValue.forEach(() => this.setAnswerFormArray('second_value'));
  }

  private setColors(): void {
    const useColors = this.question.shape !== 'BUG' && this.question.shape !== 'FRUIT';
    if (useColors) {
      this.firstColor = this.colors.find(color => color.name === this.question.first_style).hex;
      this.secondColor = this.colors.find(color => color.name === this.question.second_style).hex;
    }
  }

  private wrongAnswerVibration(): void {
    const inputs = document.querySelectorAll('.drop-area');
    inputs.forEach(input => input.classList.add('vibration'));
    setTimeout(() => {
      inputs.forEach(input => input.classList.remove('vibration'));
    }, 500);
  }

  private submitAnswer(): void {
    const left_value = this.valueForm.controls.first_value.value;
    const right_value = this.valueForm.controls.second_value.value;
    const final_value = this.valueForm.controls.final_value.value;
    if (!this.answer) {
      this.answer = {
        left_value,
        right_value,
        final_value,
        question: this.question.id,
        attempt: this.isValid(),
        valid: this.isValid()
      };
    } else {
      this.answer.attempt = this.isValid();
    }
    this.answerChange.emit({ answer: this.answer, next: this.answer.attempt, answerAnimationPosition: this.dropPosition });
  }
}
