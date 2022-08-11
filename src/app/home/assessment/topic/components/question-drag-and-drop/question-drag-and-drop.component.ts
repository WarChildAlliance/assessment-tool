import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { QuestionDragDrop, DraggableOption } from 'src/app/core/models/question.model';
import { AssisstantService } from 'src/app/core/services/assisstant.service';
import { Attachment } from 'src/app/core/models/attachment.model';
import { AnswerDragAndDrop } from 'src/app/core/models/answer.model';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-question-drag-and-drop',
  templateUrl: './question-drag-and-drop.component.html',
  styleUrls: ['./question-drag-and-drop.component.scss']
})
export class QuestionDragAndDropComponent implements OnInit {

  @Input() question: QuestionDragDrop;
  @Input() answer: AnswerDragAndDrop;
  @Input() displayCorrectAnswer: BehaviorSubject<boolean>;

  @Output() answerChange = new EventEmitter<AnswerDragAndDrop>();

  private readonly pageID = 'question-drag-and-drop-page';

  public backgroundImage: string = null;
  public isDropAreaVisible = false;

  public draggableOptions: DraggableOption[];
  public answerDropListData: Array<DraggableOption>;
  private correctAnswer: DraggableOption[] = [];

  // Points to either answerDropListData or correctAnswer
  // depending on displayCorrectAnswer
  public displayedAnswer: DraggableOption[] = [];
  
  constructor(
    private assisstantService: AssisstantService,
  ) { }

  ngOnInit(): void {
    this.assisstantService.setPageID(this.pageID);

    const bgImageUrl = this.question.attachments.find(
      e => e.attachment_type === 'IMAGE' && e.background_image).file;
    this.backgroundImage = this.getSource(bgImageUrl);

    this.draggableOptions = [...this.question.draggable_options];
    this.answerDropListData = new Array<DraggableOption>(this.question.drop_areas.length);
    this.question.drop_areas.forEach(area => {
      this.correctAnswer.push(this.draggableOptions.find(e => e.area_option.includes(area.id)));
    });

    this.displayedAnswer = this.answerDropListData;
    this.displayCorrectAnswer.subscribe((res: boolean) => {
      this.displayedAnswer = res ? this.correctAnswer : this.answerDropListData;
    });
  }

  private isAnswerValid() {
    return this.answerDropListData.every(
      (e: DraggableOption, index: number) => {
        return e.area_option.includes(this.question.drop_areas[index].id);
      });
  }

  private saveAnswer() {
    this.answer = {
      question: this.question.id,
      valid: this.isAnswerValid(),
      answers_per_area: this.answerDropListData.map(
        (e: DraggableOption, index: number) => {
          return e ? {
            selected_draggable_options: [e.id],
            area: this.question.drop_areas[index].id
          } : null;
        }).filter(e => !!e)
    }
    this.answerChange.emit(this.answer);
  }

  public getSource(path: string): string {
    return path.includes(environment.API_URL) ? path : environment.API_URL + path;
  }

  public getImageAttachment(attachments: Attachment[]): string {
    return this.getSource(attachments.find(e => e.attachment_type === 'IMAGE').file);
  }

  public swapArrayItem(previousArr: any[], targetArr: any[],
    previousIndex: number, targetIndex: number, fixedTargetLen: boolean): void {
    if (previousArr === targetArr) { return; }
    if (fixedTargetLen) {
      targetArr[targetIndex] = previousArr[previousIndex];
      previousArr.splice(previousIndex, 1);
    } else {
      targetArr.splice(targetIndex, 0, previousArr[previousIndex]);
      previousArr[previousIndex] = undefined;
    }
    this.saveAnswer();
  }

  public onDragEvent(): void {
    this.isDropAreaVisible = !this.isDropAreaVisible;
  }
}
