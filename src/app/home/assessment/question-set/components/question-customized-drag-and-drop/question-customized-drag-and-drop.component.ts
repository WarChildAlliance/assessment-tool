import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { BehaviorSubject } from 'rxjs';
import { AnswerCustomizedDragAndDrop } from 'src/app/core/models/answer.model';
import { QuestionCustomizedDragAndDrop } from 'src/app/core/models/question.model';
import { AssisstantService } from 'src/app/core/services/assisstant.service';

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
  @Output() answerChange = new EventEmitter<{ answer: AnswerCustomizedDragAndDrop; next: boolean }>();

  public draggableNumbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

  public operatorSymbol: string;
  public operatorTypes = [
    { id: 'ADDITION', symbol: '+' },
    { id: 'SUBTRACTION', symbol: '-' },
    { id: 'DIVISION', symbol: '÷' },
    { id: 'MULTIPLICATION', symbol: '×' }
  ];

  public valueForm: FormGroup = new FormGroup({
    first_value: new FormControl(null),
    second_value: new FormControl(null),
    final_value: new FormControl(null)
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
    private assisstantService: AssisstantService,
    public translate: TranslateService,

  ) { }

  ngOnInit(): void {
    this.assisstantService.setPageID(this.pageID);
    this.setOperator();
    this.setColors();

    this.resetAnswer.subscribe((value: boolean) => {
      if (value) {
        this.valueForm.reset();
        this.wrongAnswerVibration();
      }
    });

    this.valueForm.valueChanges.subscribe(value => {
      const checkValues = this.valueForm.controls.first_value.value
        && this.valueForm.controls.second_value.value
        && this.valueForm.controls.final_value.value;

      if (checkValues) {
        this.submitAnswer();
      }
    });
  }

  private isValid(): boolean {
    return this.answerNumber === this.valueForm.controls.final_value.value
      && this.valueForm.controls.first_value.value === this.question.first_value
      && this.valueForm.controls.second_value.value === this.question.second_value;
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
        valid: this.isValid()
      };
    } else {
      this.answer.left_value = left_value;
      this.answer.right_value = right_value;
      this.answer.final_value = final_value;
      this.answer.valid = this.isValid();
    }
    this.answerChange.emit({ answer: this.answer, next: this.answer.valid });
  }
}
