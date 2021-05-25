import { Component, Inject, OnInit } from '@angular/core';
import {MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';


@Component({
  selector: 'app-feedback',
  templateUrl: './feedback.component.html',
  styleUrls: ['./feedback.component.scss']
})
export class FeedbackComponent implements OnInit{

  public answer: any;
  public solution: any;

  constructor(
    public dialogRef: MatDialogRef<FeedbackComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) {}

  ngOnInit(): void {
    this.reviseAnswer();
  }

  onClose(): void {
    this.dialogRef.close();
  }

  reviseAnswer(): void{
    const currentAnswer = this.data.answer;
    const currentSolution = this.data.solution;
    switch (this.data.solution.question_type) {
      case 'NUMBER_LINE':
        this.answer = [{value: currentAnswer.value, valid: this.data.valid}];
        this.solution = currentSolution.expected_value;
        break;

      case 'SORT':
        const option = this.getOptions(currentSolution);
        this.answer = this.getSortAnswer(option, currentSolution, currentAnswer);
        this.solution =  [{category_A: currentSolution.category_A, data_A: option.category_A},
                          {category_B: currentSolution.category_B, data_B: option.category_B}];
        break;

      case 'SELECT':
        this.answer = currentAnswer.selected_options.map(a => {
          return {value: currentSolution.options.find(x => x.id === a).value,
                  valid: currentSolution.options.find(x => x.id === a).valid};
        });
        this.solution = currentSolution.options.filter(o => o.valid).map(a => a.value);
        break;

      case 'INPUT':
        this.answer = [{value: currentAnswer.value, valid: this.data.valid}];
        this.solution = currentSolution.valid_answer;
        break;
    }
  }

  getSortAnswer(option, currentSolution, currentAnswer): any{
   return {
      category_A: currentSolution.category_A,
      data_A: currentAnswer.category_A.map(a => {
        return {value: currentSolution.options.find(x => x.id === a).value,
        valid: option.category_A.includes(currentSolution.options.find(x => x.id === a).value.toString())};
      }),
      category_B: currentSolution.category_B,
      data_B: currentAnswer.category_B.map(a => {
          return {value: currentSolution.options.find(x => x.id === a).value,
          valid: option.category_B.includes(currentSolution.options.find(x => x.id === a).value.toString())};
      })};
  }


  getOptions(solution): any{
    const options = {category_A: [], category_B: []};
    solution.options.forEach(option => {
      if (option.category === solution.category_A) {
        options.category_A.push(option.value);
      } else {
        options.category_B.push(option.value);
      }
    });
    return options;
  }

}
