import { Component, OnInit, Input, Output, EventEmitter, OnDestroy } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { QuestionDragDrop, DraggableOption } from 'src/app/core/models/question.model';
import { Attachment } from 'src/app/core/models/attachment.model';
import { AnswerDragAndDrop, DragAndDropAreaEntry } from 'src/app/core/models/answer.model';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-question-drag-and-drop',
  templateUrl: './question-drag-and-drop.component.html',
  styleUrls: ['./question-drag-and-drop.component.scss']
})
export class QuestionDragAndDropComponent implements OnInit, OnDestroy {

  @Input() question: QuestionDragDrop;
  @Input() answer: AnswerDragAndDrop;
  @Input() displayCorrectAnswer: BehaviorSubject<boolean>;
  @Input() resetAnswer: BehaviorSubject<boolean>;

  @Output() answerChange = new EventEmitter<{
    answer: AnswerDragAndDrop; next: boolean; answerAnimationPosition: {x: number; y: number};
  }>();

  public backgroundImage: string = null;
  public isDropAreaVisible = false;
  public goNextQuestion: boolean;
  public validatedAnswers = 0;
  public answersPerArea: DragAndDropAreaEntry[];
  public firstAttemptAnswers: DragAndDropAreaEntry[] = [];

  public draggableOptions: DraggableOption[];
  public answerDropListData: Array<DraggableOption>;
  public dropPosition: {x: number; y: number};

  // Points to either answerDropListData or correctAnswer
  // depending on displayCorrectAnswer
  public displayedAnswer: DraggableOption[] = [];

  private correctAnswer: DraggableOption[] = [];

  constructor() { }

  ngOnInit(): void {

    const bgImageUrl = this.question.attachments.find(
      e => e.attachment_type === 'IMAGE' && e.background_image).file;
    this.backgroundImage = this.getSource(bgImageUrl);

    this.draggableOptions = [...this.question.draggable_options];

    // Create an array of answers with an index for each area of the question
    this.answerDropListData = new Array<DraggableOption>(this.question.drop_areas.length);

    this.question.drop_areas.forEach(area => {
      this.correctAnswer.push(this.draggableOptions.find(e => e.area_option === area.id));
    });

    this.displayedAnswer = this.answerDropListData;
    this.displayCorrectAnswer.subscribe((res: boolean) => {
      this.displayedAnswer = res ? this.correctAnswer : this.answerDropListData;
    });

    this.resetAnswer.subscribe((value: boolean) => {
      if (value) {
        const previousIndex = this.answerDropListData.indexOf(
          this.answerDropListData.find((e: DraggableOption, index: number) =>
            e !== undefined && e?.area_option !== this.question.drop_areas[index].id
          )
        );
        const targetIndex = this.draggableOptions.length;

        // Remove the wrong drag option of the area and puts it back at the end of draggableOptions array
        this.swapArrayItem(this.answerDropListData, this.draggableOptions, previousIndex, targetIndex, false, false);
      }
    });
  }

  ngOnDestroy(): void {
    this.displayCorrectAnswer.next(false);
    this.resetAnswer.next(false);
    this.answer = null;
  }

  // TODO: this is called BILLIONS of times and also when we hover the images
  public getSource(path: string): string {
    return path.includes(environment.API_URL) ? path :
      path.includes([environment.API_URL.slice(0, 4), environment.API_URL.slice(5, environment.API_URL.length)].join('')) ?
      [path.slice(0, 4), 's', path.slice(4)].join('') : environment.API_URL + path;
  }

  public getImageAttachment(attachments: Attachment[]): string {
    return this.getSource(attachments.find(e => e.attachment_type === 'IMAGE').file);
  }

  public swapArrayItem(
    previousArr: any[], targetArr: any[],
    previousIndex: number, targetIndex: number,
    fixedTargetLen: boolean, resetAnswer?: boolean
  ): void {
    if (previousArr === targetArr) {
      return; }
    if (fixedTargetLen) {
      targetArr[targetIndex] = previousArr[previousIndex];
      previousArr.splice(previousIndex, 1);
    } else {
      targetArr.splice(targetIndex, 0, previousArr[previousIndex]);
      previousArr[previousIndex] = undefined;
    }

    // If student manually removed correct answer: decrease validated Answers
    if (targetArr === this.draggableOptions && resetAnswer) {
      this.validatedAnswers -= this.validatedAnswers ? 1 : 0;
    }
    this.saveAnswer();
  }

  public onDragEvent(): void {
    this.isDropAreaVisible = !this.isDropAreaVisible;
  }

  // check drag&drop answer: if it's wrong displays vibration animation
  public checkRightAnswer(areaIndex: number): boolean {
    const answerOption = [...this.answerDropListData][areaIndex];
    return this.correctAnswer.some(answer =>
      answerOption.id === answer.id && answer.area_option === answerOption.area_option
    );
  }

  private isAnswerValid(): boolean {
    const valid = this.answerDropListData.every(
      (e: DraggableOption, index: number) => e.area_option === this.question.drop_areas[index].id);

    this.goNextQuestion = this.question.draggable_options.every(option =>
      (option.area_option === null) || (
        this.answersPerArea.find(answer =>
          answer.selected_draggable_option === option.id && option.area_option === answer.area)
      )
    );

    this.validatedAnswers += valid ? 1 : 0;
    return valid;
  }

  private saveAnswer(): void {
    if (this.answerDropListData.some(answer => answer !== undefined)) {
      this.answersPerArea = this.answerDropListData.map(
        (e: DraggableOption, index: number) => e ? {
          selected_draggable_option: e.id,
          area: this.question.drop_areas[index].id
        } : null).filter(e => !!e);

      // only submit answer and play sound if new drag&drop answer
      if (this.answersPerArea.length !== this.validatedAnswers) {
        const valid = this.isAnswerValid();
        if (!this.answer) {
          this.answer = {
            question: this.question.id,
            attempt: valid,
            valid,
            answers_per_area_attempt: [],
            answers_per_area: []
          };
        }
        // First attempt to answer
        if (this.correctAnswer.length !== this.firstAttemptAnswers.length) {
          this.answersPerArea.forEach(answer => {
            if (!this.firstAttemptAnswers.find(op => op.area === answer.area)) {
              this.firstAttemptAnswers.push(answer);
            }
          });
          this.answer.answers_per_area = this.firstAttemptAnswers;
          this.answer.valid = this.firstAttemptAnswers.every(
            (e: DragAndDropAreaEntry) => this.correctAnswer.find(
              a => e.area === a.area_option && e.selected_draggable_option === a.id
            ));
        }

        this.answer.answers_per_area_attempt = this.answersPerArea;
        this.answer.attempt = valid;
        this.answerChange.emit({ answer: this.answer, next: this.goNextQuestion, answerAnimationPosition: this.dropPosition });
      }
    }
  }
}
