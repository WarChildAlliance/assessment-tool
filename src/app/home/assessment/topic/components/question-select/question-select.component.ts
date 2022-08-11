import { AfterViewInit, Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { AnswerSelect } from 'src/app/core/models/answer.model';
import { QuestionSelect, SelectOption } from 'src/app/core/models/question.model';
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

    @Input() isEvaluated: boolean;

    @Output() answerChange = new EventEmitter<AnswerSelect>();

    private readonly pageID = 'question-select-page';

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
        this.displayCorrectAnswer.subscribe((value: boolean) => {
            if (value && this.question.multiple) {
                this.multipleSelectForm.disable();
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
                        valid: false
                    };
                    this.answer.valid = this.isMultipleValid(formattedSelectedOptions);
                } else {
                    this.tutorialSerice.currentPage.next(PageNames.question);
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

    public getAnswerBackgroundStyle(option: any): string {
        return this.displayCorrectAnswer.getValue() && !!this.answer && this.answer.selected_options.includes(option.id) && !option.valid ? 'invalid'
            : this.displayCorrectAnswer.getValue() && option.valid ? 'valid' : '';
    }

    public setCheckboxSelection(index: number): void {
        if (this.displayCorrectAnswer.getValue()) {
            return;
        }
        const selectedOptionsForm = this.multipleSelectForm.get('selectedOptions') as FormArray;

        const optionalValue = selectedOptionsForm.controls[index].value.selected;

        selectedOptionsForm.controls[index].setValue({selected: !optionalValue});
    }


    public hasImageAttached(option: SelectOption): boolean {
        return option.attachments.some((attachment) => attachment.attachment_type === 'IMAGE');
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
