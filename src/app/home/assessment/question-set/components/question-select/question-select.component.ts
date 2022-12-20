import { AfterViewInit, Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormControl } from '@angular/forms';
import { AnswerSelect } from 'src/app/core/models/answer.model';
import { QuestionSelect } from 'src/app/core/models/question.model';
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

    @Output() answerChange = new EventEmitter<{answer: AnswerSelect; next: boolean}>();

    public multipleValidAnswers = 0;
    public timeout = 500;

    public valueForm = new FormControl(null);

    private readonly pageID = 'question-select-page';

    constructor(
        private assisstantService: AssisstantService,
        private tutorialSerice: TutorialService,
        private tutorialSlideshowService: TutorialSlideshowService,
    ) {
    }

    ngOnInit(): void {
        this.assisstantService.setPageID(this.pageID);
        this.tutorialSlideshowService.showTutorialForPage(this.pageID);

        // shuffle evaluated options
        if (this.isEvaluated && this.question.shuffle) {
            this.question.options = this.question.options.map(question => ({
                question,
                sort: Math.random()
            })).sort((a, b) => a.sort - b.sort).map((value) => value.question);
        }

        this.valueForm.valueChanges.subscribe(value => {
            if (value) {
                this.wrongAnswerVibration(this.question.options.indexOf(value));
                if (!this.answer) {
                    this.answer = {
                        selected_option: value.id,
                        question: this.question.id,
                        valid: this.isValid()
                    };
                } else {
                    this.answer.selected_option = value.id;
                    this.answer.valid = this.isValid();
                }
                this.answerChange.emit({answer: this.answer, next: this.answer.valid});
            }
        });
    }

    ngAfterViewInit(): void {
        this.tutorialSerice.currentPage.next(PageNames.questionSelect);
        this.setOptionsContainerStyle();
    }

    ngOnDestroy(): void {
        this.displayCorrectAnswer.next(false);
        this.answer = null;
    }

    public getOptionBtnStyle(option: any): string {
        return !!this.answer && this.answer.selected_option === option.id && !option.valid ?
            'elevated-invalid--outline' : (this.displayCorrectAnswer.getValue() && option.valid) ?
            'elevated-valid--outline' : 'elevated-basic--outline';
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
                const optionsContainerRef = document.getElementById('one-choice');
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

    // check selected option: if it's wrong displays vibration animation
    private wrongAnswerVibration(areaIndex: number): void {
        if (!this.isValid()) {
            const checkedOption = document.getElementById(
                'option-'+ areaIndex.toString() + (this.question.show_options_title ? '-label' : '-image')
            ) as HTMLElement;
            checkedOption.classList.add('vibration');
            this.valueForm.setValue(null);

            setTimeout(() => {
                if (this.question.show_options_title) {
                    checkedOption.classList.remove('elevated-invalid--outline');
                    checkedOption.classList.add('elevated-basic--outline');
                }
                checkedOption.classList.remove('vibration');
            }, this.timeout);
        }
    }

    private isValid(): boolean {
        return this.valueForm.value?.valid;
    }
}
