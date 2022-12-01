import { DragDropModule } from '@angular/cdk/drag-drop';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSliderModule } from '@angular/material/slider';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatRadioModule } from '@angular/material/radio';
import { MatCheckboxModule } from '@angular/material/checkbox';
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
import { MatDialogModule } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { QuestionDragAndDropComponent } from './components/question-drag-and-drop/question-drag-and-drop.component';
import { QuestionDominoComponent } from './components/question-domino/question-domino.component';
import { QuestionSelComponent } from './components/question-sel/question-sel.component';
import { QuestionCalculComponent } from './components/question-calcul/question-calcul.component';
import {
    QuestionCustomizedDragAndDropComponent
} from './components/question-customized-drag-and-drop/question-customized-drag-and-drop.component';
import { ShapesComponent } from './components/shapes/shapes.component';

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
        QuestionDragAndDropComponent,
        QuestionDominoComponent,
        QuestionSelComponent,
        QuestionCalculComponent,
        QuestionCustomizedDragAndDropComponent,
        ShapesComponent,
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
        MatCardModule,
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
        MatRadioModule,
        MatCheckboxModule
    ]
})
export class TopicModule {
}
