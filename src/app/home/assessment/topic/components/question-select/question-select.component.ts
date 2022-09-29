import { AfterViewInit, Component, ElementRef, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { AnswerSelect } from 'src/app/core/models/answer.model';
import { QuestionSelect, SelectOption } from 'src/app/core/models/question.model';
import { Attachment } from 'src/app/core/models/attachment.model';
import { BehaviorSubject } from 'rxjs';
import { TutorialService } from 'src/app/core/services/tutorial.service';
import { PageNames } from 'src/app/core/utils/constants';
import { AssisstantService } from 'src/app/core/services/assisstant.service';
import { environment } from 'src/environments/environment';
import { TutorialSlideshowService } from 'src/app/core/services/tutorial-slideshow.service';

@Component({
    selector: 'app-question-select',
    templateUrl: './question-select.component.html',
    styleUrls: ['./question-select.component.scss']
})
export class QuestionSelectComponent implements OnInit, OnDestroy, AfterViewInit {

    @Input() answer: AnswerSelect;

    @Input() question: QuestionSelect;

    @Input() displayCorrectAnswer: BehaviorSubject<boolean>;

    @Input() resetAnswer: BehaviorSubject<boolean>;

    @Input() isEvaluated: boolean;

    @Output() answerChange = new EventEmitter<{answer: AnswerSelect, next: boolean}>();

    private readonly pageID = 'question-select-page';
    public multipleValidAnswers = 0;
    public goNextQuestion: boolean;
    public timeout = 500;

    public valueForm = new FormControl(null);
    public multipleSelectForm: FormGroup = new FormGroup({
        selectedOptions: new FormArray([]),
    });

    constructor(
        private formBuilder: FormBuilder,
        private assisstantService: AssisstantService,
        private tutorialSerice: TutorialService,
        private tutorialSlideshowService: TutorialSlideshowService,
    ) {
    }

    ngOnInit(): void {
        this.assisstantService.setPageID(this.pageID);
        this.tutorialSlideshowService.showTutorialForPage(this.pageID);

        this.resetAnswer.subscribe((value: boolean) => {
            if (value) {
                // When the student select the wrong answer: reset options
                if (this.question.multiple) {
                    this.multipleSelectForm.controls.selectedOptions.reset();
                } else {
                    this.valueForm.setValue(null);
                    const index = this.question.options.indexOf(
                        this.question.options.find(op => op.id === this.answer.selected_options[0])
                    );
                    const checkedOption = document.getElementById('option-radio-' + index.toString()) as HTMLInputElement;
                    checkedOption.checked = false;
                }
            }
        });

        // shuffle evaluated options
        if (this.isEvaluated) {
            this.question.options = this.question.options.map(question => ({
                question,
                sort: Math.random()
            })).sort((a, b) => a.sort - b.sort).map((value) => value.question);
        }

        if (this.question.multiple) {
            this.generateMultipleSelectForm();
            this.question.options.forEach(
                option => {
                    if (option.valid) {
                        this.multipleValidAnswers += 1;
                    }
                }
            );

            // we disabled the checkboxes because we handler the selection using (click) event
            // that calls the method setCheckboxSelection(index: number)
            this.multipleSelectForm.disable();

            this.multipleSelectForm.valueChanges.subscribe(value => {

                const formattedSelectedOptions = value.selectedOptions.map(
                    (checked, index) => checked.selected ? this.question.options[index].id : null
                ).filter(
                    option => !!option
                );

                if (!formattedSelectedOptions.length) {
                    return;
                }

                this.checkRightAnswer(this.question.options.indexOf(
                        this.question.options.find((op, index) => value.selectedOptions[index].selected && !op.valid)
                    )
                    , formattedSelectedOptions
                );

                if (!this.answer) {
                    this.answer = {
                        selected_options: formattedSelectedOptions,
                        question: this.question.id,
                        valid: false
                    };
                    this.answer.valid = this.isMultipleValid(formattedSelectedOptions);
                } else {
                    this.tutorialSerice.currentPage.next(PageNames.question);
                    this.answer.selected_options = formattedSelectedOptions;
                    this.answer.valid = this.isMultipleValid(formattedSelectedOptions);
                }
                this.answerChange.emit({answer: this.answer, next: this.goNextQuestion});
            });
        } else {
            this.valueForm.valueChanges.subscribe(value => {
                if (value) {
                    this.checkRightAnswer(this.question.options.indexOf(value));
                    if (!this.answer) {
                        this.answer = {
                            selected_options: [value.id],
                            question: this.question.id,
                            valid: this.isValid()
                        };
                    } else {
                        this.answer.selected_options = [value.id];
                        this.answer.valid = this.isValid();
                    }

                    this.answerChange.emit({answer: this.answer, next: this.goNextQuestion});
                }
            });
        }
    }

    ngAfterViewInit(): void {
        this.tutorialSerice.currentPage.next(PageNames.questionSelect);
        this.setOptionsContainerStyle();
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
    // check selected option: if it's wrong displays vibration animation
    private checkRightAnswer(areaIndex: number, formattedSelectedOptions?: number[]): void {
        if (this.question.multiple && !this.isMultipleValid(formattedSelectedOptions)) {
            this.wrongAnswerVibration(areaIndex);
        } else if (!this.question.multiple && !this.isValid()) {
            this.wrongAnswerVibration(areaIndex);
        }
    }

    private wrongAnswerVibration(areaIndex: number): void {
        const label = document.getElementById('option-' + areaIndex.toString() + '-label') as HTMLLabelElement;
        label.classList.add('vibration');
        setTimeout(() => {
            label.classList.remove('vibration');
        }, this.timeout);
    }

    private isValid(): boolean {
        this.goNextQuestion = this.valueForm.value?.valid ? true : false;
        return this.valueForm.value?.valid;
    }

    private isMultipleValid(selectedOptionsIds: number[]): boolean {

        const valid = selectedOptionsIds.length === this.multipleValidAnswers
        ? this.question.options.every(
            option => (
                (option.valid && selectedOptionsIds.includes(option.id))
                ||
                (!option.valid && !selectedOptionsIds.includes(option.id))
            )
        )
        : selectedOptionsIds.every(
            id => (
                this.question.options.find(option => option.id === id && option.valid)
            )
        );

        this.goNextQuestion = valid && selectedOptionsIds.length === this.multipleValidAnswers
            ? true : false;

        return valid;
    }

    public getOptionBtnStyle(option: any): string {
        return this.displayCorrectAnswer.getValue() && !!this.answer && this.answer.selected_options.includes(option.id) && !option.valid ?
            'elevated-invalid--outline' : (this.displayCorrectAnswer.getValue() && option.valid) ?
            'elevated-valid--outline' : 'elevated-basic--outline';
    }

    public setCheckboxSelection(index: number): void {
        if (this.displayCorrectAnswer.getValue()) {
            return;
        }
        const selectedOptionsForm = this.multipleSelectForm.get('selectedOptions') as FormArray;

        const optionalValue = selectedOptionsForm.controls[index].value.selected;

        selectedOptionsForm.controls[index].setValue({selected: !optionalValue});
    }

    public getAttachmentOfType(attachments: Attachment[], type: 'IMAGE' | 'AUDIO'): Attachment {
        return attachments.find(e => e.attachment_type === type);
    }

    public getSource(path: string): string{
        return environment.API_URL + path;
    }

    // Check the length of options and apply css style for big buttons in 1 single column
    // In case of using display_type again: delete this function
    private setOptionsContainerStyle(): void {
        for (const option of this.question.options) {
            if (option.title?.length > 14) {
                const optionsContainerRef = document.getElementById(this.question.multiple ? 'multiple-choice' : 'one-choice');
                optionsContainerRef.style.justifyContent = 'center';

                optionsContainerRef.childNodes.forEach(optionRef => {
                    if (optionRef.nodeName === 'DIV') {
                        (optionRef as HTMLElement).style.width = '100%';
                    }
                });
                break;
            }
        }
    }

    ngOnDestroy(): void {
        this.displayCorrectAnswer.next(false);
        this.answer = null;
    }
}
