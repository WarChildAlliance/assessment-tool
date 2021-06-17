import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { AnswerSelect } from 'src/app/core/models/answer.model';
import { QuestionSelect, SelectOption } from 'src/app/core/models/question.model';

@Component({
    selector: 'app-question-select',
    templateUrl: './question-select.component.html',
    styleUrls: ['./question-select.component.scss']
})
export class QuestionSelectComponent implements OnInit {
    @Input() answer: AnswerSelect;

    private receivedQuestion: QuestionSelect;

    @Input() set question(value: QuestionSelect) {
        this.receivedQuestion = value;

        if (this.receivedQuestion.multiple) {
            this.generateMultipleSelectForm();
        }
    }

    get question(): QuestionSelect {
        return this.receivedQuestion;
    }

    displayAnswer: boolean;

    @Input() set displayCorrectAnswer(value: boolean) {
        this.displayAnswer = value;
        if (this.displayAnswer && this.question.multiple) {
            this.multipleSelectForm.disable();
        }
    }

    @Output() answerChange = new EventEmitter<AnswerSelect>();

    valueForm = new FormControl(null);
    multipleSelectForm: FormGroup = new FormGroup({
        selectedOptions: new FormArray([]),
    });

    selectedOptions = [];

    constructor(private formBuilder: FormBuilder) {
    }

    ngOnInit(): void {
        if (this.question.multiple) {
            this.multipleSelectForm.valueChanges.subscribe(value => {
                this.selectedOptions = [];
                value.selectedOptions.forEach((val, index) => {
                    if (val.selected) {
                        this.selectedOptions.push(this.question.options[index]);
                        this.answer = {
                            selected_options: this.formatSelectedOptions(this.question.options[index]),
                            question: this.question.id,
                            duration: 0,
                            valid: this.isValid()
                        };
                        this.answerChange.emit(this.answer);
                    }
                });
            });
        } else {
            this.valueForm.valueChanges.subscribe(value => {
                if (value) {
                    this.answer = {
                        selected_options: this.formatSelectedOptions(value),
                        question: this.question.id,
                        duration: 0,
                        valid: this.isValid()
                    };
                    this.answerChange.emit(this.answer);
                }
            });
        }
    }

    private generateMultipleSelectForm(): void {
        const selectedOptionsForm = this.multipleSelectForm.get('selectedOptions') as FormArray;

        this.question.options.forEach((option) => {
            const selectOption = this.formBuilder.group({
                selected: new FormControl(false),
            });
            selectedOptionsForm.push(selectOption);
        });
    }

    private isValid(): boolean {
        if (!this.question.multiple) {
            return this.valueForm.value.valid;
        }
        const validOptionsLength = this.question.options.filter(option => option.valid).length;
        const validSelectedOptionsLength = this.selectedOptions.filter(option => option.valid).length;
        return validOptionsLength === validSelectedOptionsLength;
    }

    private formatSelectedOptions(value: SelectOption | SelectOption[]): number[] {
        if (Array.isArray(value)) {
            return value.map(option => option.id);
        }

        return [value.id];
    }

    setAnswerBackground(option: any): string {
        return this.displayAnswer && this.answer.selected_options.includes(option.id) && !option.valid ? '#F2836B'
            : this.displayAnswer && option.valid ? '#7EBF9A' : '';
    }
}
