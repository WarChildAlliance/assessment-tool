import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CompletedTopicComponent } from './components/completed-topic/completed-topic.component';
import { QuestionComponent } from './components/question/question.component';
import { TopicComponent } from './topic.component';

const routes: Routes = [
  {
    path: '',
    component: TopicComponent
  },
  {
    path: 'questions/:question_id',
    component: QuestionComponent
  },
  {
    path: 'completed',
    component: CompletedTopicComponent
  },
  {
    path: '**',
    redirectTo: '',
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TopicRoutingModule { }
