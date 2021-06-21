import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormControl } from '@angular/forms';
import { AnswerInput } from 'src/app/core/models/answer.model';
import { QuestionInput } from 'src/app/core/models/question.model';
import { BehaviorSubject } from "rxjs";

@Component({
    selector: 'app-question-input',
    templateUrl: './question-input.component.html',
    styleUrls: ['./question-input.component.scss']
})
export class QuestionInputComponent implements OnInit, OnDestroy {
    @Input() question: QuestionInput;
    @Input() answer: AnswerInput;
    @Input() displayCorrectAnswer: BehaviorSubject<boolean>;

    @Output() answerChange = new EventEmitter<AnswerInput>();

    valueForm = new FormControl(null);

    constructor() {
    }

    ngOnInit(): void {
        console.log('HOLI input');
        this.displayCorrectAnswer.next(false);
        this.valueForm.valueChanges.subscribe(value => {
            if (value) {
                if (!this.answer) {
                    this.answer = {
                        value,
                        question: this.question.id,
                        duration: 0,
                        valid: this.isValid()
                    };
                } else {
                    this.answer.value = value;
                    this.answer.valid = this.isValid();
                }
                this.answerChange.emit(this.answer);
            }
        });
    }

    isValid(): boolean {
        return this.valueForm.value === this.question.valid_answer;
    }

    ngOnDestroy(): void {
        this.answer = null;
        this.displayCorrectAnswer.next(false);
    }
}
