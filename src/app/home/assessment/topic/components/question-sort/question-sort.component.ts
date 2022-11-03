import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { AnswerSort } from 'src/app/core/models/answer.model';
import { QuestionSort, SortOption } from 'src/app/core/models/question.model';
import { BehaviorSubject } from 'rxjs';
import { AssisstantService } from 'src/app/core/services/assisstant.service';

@Component({
    selector: 'app-question-sort',
    templateUrl: './question-sort.component.html',
    styleUrls: ['./question-sort.component.scss']
})
export class QuestionSortComponent implements OnInit, OnDestroy {
    @Input() question: QuestionSort;
    @Input() displayCorrectAnswer: BehaviorSubject<boolean>;

    @Input() answer: AnswerSort;
    @Output() answerChange = new EventEmitter<AnswerSort>();

    public optionsCopy: SortOption[] = [];
    public selectedCategoryA: SortOption[] = [];
    public selectedCategoryB: SortOption[] = [];

    private readonly pageID = 'question-sort-page';

    constructor(private assisstantService: AssisstantService) {
    }

    ngOnInit(): void {
        this.assisstantService.setPageID(this.pageID);
        this.optionsCopy = [].concat(this.question.options);
    }

    ngOnDestroy(): void {
        this.displayCorrectAnswer.next(false);
        this.answer = null;
    }

    public drop(event: CdkDragDrop<string[]>): void {
        if (event.previousContainer === event.container) {
            moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
        } else {
            transferArrayItem(event.previousContainer.data,
                event.container.data,
                event.previousIndex,
                event.currentIndex);
        }
        this.updateAnswer();
    }

    public setAnswerBackground(option: any): string {
        if (!this.displayCorrectAnswer.getValue()) {
            return '';
        }
        return this.answer.category_A.includes(option.id) && option.category !== this.question.category_A ? '#F2836B' :
            this.answer.category_B.includes(option.id) && option.category !== this.question.category_B ? '#F2836B' : '';
    }

    private updateAnswer(): void {
        if (!this.answer) {
            this.answer = {
                question: this.question.id,
                valid: this.isValid(),
                category_A: this.selectedCategoryA.map(option => option.id),
                category_B: this.selectedCategoryB.map(option => option.id)
            };
        } else {
            this.answer.category_A = this.selectedCategoryA.map(option => option.id);
            this.answer.category_B = this.selectedCategoryB.map(option => option.id);
            this.answer.valid = this.isValid();
        }
        this.answerChange.emit(this.answer);
    }

    private isValid(): boolean {
        const expectedCategoryA = this.question.options
            .filter(option => option.category === this.question.category_A);
        const expectedCategoryB = this.question.options.filter(
            option => option.category === this.question.category_B);

        if (expectedCategoryA.length !== this.selectedCategoryA.length ||
            expectedCategoryB.length !== this.selectedCategoryB.length) {
            return false;
        }

        return this.selectedCategoryA.every(
            option => expectedCategoryA.findIndex(o => o.id === option.id) >= 0);
    }
}
