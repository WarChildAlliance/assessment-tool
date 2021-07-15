import { ChangeDetectorRef, Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { AnswerSelect } from 'src/app/core/models/answer.model';
import { QuestionSelect, SelectOption } from 'src/app/core/models/question.model';
import { BehaviorSubject } from 'rxjs';
import { AssisstantService } from 'src/app/core/services/assisstant.service';

@Component({
    selector: 'app-question-select',
    templateUrl: './question-select.component.html',
    styleUrls: ['./question-select.component.scss']
})
export class QuestionSelectComponent implements OnInit, OnDestroy {

    @Input() answer: AnswerSelect;

    @Input() question: QuestionSelect;

    @Input() displayCorrectAnswer: BehaviorSubject<boolean>;

    @Output() answerChange = new EventEmitter<AnswerSelect>();

    valueForm = new FormControl(null);
    multipleSelectForm: FormGroup = new FormGroup({
        selectedOptions: new FormArray([]),
    });
    private readonly pageID = 'question-select-page';

    constructor(
        private formBuilder: FormBuilder,
        private assisstantService: AssisstantService
    ) { }

    ngOnInit(): void {
        this.assisstantService.setPageID(this.pageID);
        this.displayCorrectAnswer.subscribe((value: boolean) => {
            if (value && this.question.multiple) {
                this.multipleSelectForm.disable();
            }
        }
        );
        if (this.question.multiple) {
            this.generateMultipleSelectForm();

            // we disabled the checkboxes because we handler the selection using (click) event
            // that calls the method setCheckboxSelection(index: number)
            this.multipleSelectForm.disable();

            this.multipleSelectForm.valueChanges.subscribe(value => {

                const formattedSelectedOptions = value.selectedOptions.map(
                    (checked, index) => checked.selected ? this.question.options[index].id : null
                ).filter(
                    option => !!option
                );

                if (!this.answer) {
                    this.answer = {
                        selected_options: formattedSelectedOptions,
                        question: this.question.id,
                        duration: '',
                        valid: false
                    };
                    this.answer.valid = this.isMultipleValid(formattedSelectedOptions);
                } else {
                    this.answer.selected_options = formattedSelectedOptions;
                    this.answer.valid = this.isMultipleValid(formattedSelectedOptions);
                }
                this.answerChange.emit(this.answer);

            });
        } else {
            this.valueForm.valueChanges.subscribe(value => {
                if (value) {
                    if (!this.answer) {
                        this.answer = {
                            selected_options: [value.id],
                            question: this.question.id,
                            duration: '',
                            valid: this.isValid()
                        };
                    } else {
                        this.answer.selected_options = [value.id];
                        this.answer.valid = this.isValid();
                    }

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
        return this.valueForm.value.valid;
    }

    private isMultipleValid(selectedOptionsIds: number[]): boolean {

        const valid = this.question.options.every(
            option => (
                (option.valid && selectedOptionsIds.includes(option.id))
                ||
                (!option.valid && !selectedOptionsIds.includes(option.id))
            )
        );

        return valid;
    }

    setAnswerBackground(option: any): string {
        return this.displayCorrectAnswer.getValue() && !!this.answer && this.answer.selected_options.includes(option.id) && !option.valid ? '#F2836B'
            : this.displayCorrectAnswer.getValue() && option.valid ? '#7EBF9A' : 'white';
    }

    ngOnDestroy(): void {
        this.displayCorrectAnswer.next(false);
        this.answer = null;
    }

    setCheckboxSelection(index: number): void {
        if (this.displayCorrectAnswer.getValue()) {
            return;
        }
        const selectedOptionsForm = this.multipleSelectForm.get('selectedOptions') as FormArray;

        const optionalValue = selectedOptionsForm.controls[index].value.selected;

        selectedOptionsForm.controls[index].setValue({ selected: !optionalValue });
    }


    hasImageAttached(option: SelectOption): boolean {
        return option.attachments.some((attachment) => attachment.attachment_type === 'IMAGE');
    }
}
