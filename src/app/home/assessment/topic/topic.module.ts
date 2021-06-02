import { DragDropModule } from '@angular/cdk/drag-drop';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSliderModule } from '@angular/material/slider';
import { SharedModule } from 'src/app/shared/shared.module';
import { AttachmentsComponent } from './components/attachments/attachments.component';
import { QuestionInputComponent } from './components/question-input/question-input.component';
import { QuestionNumberLineComponent } from './components/question-number-line/question-number-line.component';
import { QuestionSelectComponent } from './components/question-select/question-select.component';
import { QuestionSortComponent } from './components/question-sort/question-sort.component';
import { QuestionComponent } from './components/question/question.component';
import { TopicRoutingModule } from './topic-routing.module';
import { TopicComponent } from './topic.component';
import { CompletedTopicComponent } from './components/completed-topic/completed-topic.component';
import { FeedbackComponent } from './components/feedback/feedback.component';
import { MatDialogModule } from '@angular/material/dialog';
import {MatDividerModule} from '@angular/material/divider';


@NgModule({
  declarations: [
    TopicComponent,
    QuestionComponent,
    QuestionInputComponent,
    QuestionSelectComponent,
    QuestionSortComponent,
    QuestionNumberLineComponent,
    AttachmentsComponent,
    CompletedTopicComponent,
    FeedbackComponent
  ],
  imports: [
    SharedModule,
    TopicRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    DragDropModule,
    MatProgressBarModule,
    MatIconModule,
    MatButtonModule,
    MatSliderModule,
    MatDialogModule,
    MatDividerModule,
  ]
})
export class TopicModule { }
