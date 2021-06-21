import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormControl } from '@angular/forms';
import { AnswerNumberLine } from 'src/app/core/models/answer.model';
import { QuestionNumberLine } from 'src/app/core/models/question.model';
import { BehaviorSubject } from "rxjs";


@Component({
    selector: 'app-question-number-line',
    templateUrl: './question-number-line.component.html',
    styleUrls: ['./question-number-line.component.scss']
})
export class QuestionNumberLineComponent implements OnInit, OnDestroy {
    @Input() question: QuestionNumberLine;
    @Input() answer: AnswerNumberLine;
    @Input() displayCorrectAnswer: BehaviorSubject<boolean>;

    @Output() answerChange = new EventEmitter<AnswerNumberLine>();

    valueForm = new FormControl(null);

    constructor() {
    }

    ngOnInit(): void {
        console.log('HOLI number line');
        this.displayCorrectAnswer.next(false);
        this.valueForm.valueChanges.subscribe(value => {
            this.submit(value);
        });
    }

    private submit(value): void {
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
    }

    private isValid(): boolean {
        const errorMargin = (this.question.end * 9) / 100;
        if (this.question.expected_value - errorMargin < this.valueForm.value
            && this.valueForm.value < this.question.expected_value + errorMargin) {
            return true;
        }
        return false;
    }

    ngOnDestroy(): void {
        this.displayCorrectAnswer.next(false);
        this.answer = null;
    }
}
