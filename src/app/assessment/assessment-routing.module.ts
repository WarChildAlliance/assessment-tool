import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TopicResolver } from '../core/resolvers/topic.resolver';
import { AssessmentComponent } from './assessment.component';
import { TopicsComponent } from './components/topics/topics.component';

const routes: Routes = [
  {
    path: '',
    component: AssessmentComponent,
    children: [
      {
        path: '',
        component: TopicsComponent
      },
      {
        path: 'topics/:topic_id',
        loadChildren: () => import('./topic/topic.module')
        .then(m => m.TopicModule),
        resolve: { topic: TopicResolver }
      },
      {
        path: '**',
        redirectTo: ''
      }
    ]
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
export class AssessmentRoutingModule { }
