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
    var currentAnswer = this.data.answer;
    var currentSolution = this.data.solution;
    switch (this.data.solution.question_type) {
      case "NUMBER_LINE":
        this.answer = "<b>" + currentAnswer.value + "</b>";
        this.solution = "<b>" + currentSolution.expected_value + "</b>";
        break;
      case "SORT":
        var option = this.getOptions(currentSolution);
        this.answer = "<p>" + currentSolution.category_A + ": " + currentAnswer.category_A + "</p>" +
        "<p>" + currentSolution.category_B + ":" + currentAnswer.category_B + "</p>";
        this.solution = "<p>" + currentSolution.category_A + ": " + option.category_A + "</p>" +
        "<p>" + currentSolution.category_B + ":" + option.category_B + "</p>";
        break;
      case "SELECT":
        this.answer = currentAnswer.selected_options.map( a => currentSolution.options[a].value);
        this.solution = currentSolution.options.filter( o => o.valid).map( a => a.value);
        break;
      case "INPUT":
        this.answer = "<b>" + currentAnswer.value + "</b>";
        this.solution = "<b>" + currentSolution.valid_answer + "</b>";
        break;
    }
  }

  onClose(): void {
    this.dialogRef.close();
  }

  getOptions(solution): any{
    var options = {category_A: [], category_B: []};
    solution.options.forEach(option => {
      if(option.category === solution.category_A) {
        options.category_A.push(option.value);
      } else {
        options.category_B.push(option.value);
      }
    })
    return options;
  }

}
