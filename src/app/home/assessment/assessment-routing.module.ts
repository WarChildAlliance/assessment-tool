import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AssessmentComponent } from './assessment.component';
import { QuestionSetsComponent } from './components/question-sets/question-sets.component';
import { QuestionSetModule } from './question-set/question-set.module';

const routes: Routes = [
  {
    path: '',
    component: AssessmentComponent,
    children: [
      {
        path: '',
        component: QuestionSetsComponent
      },
      {
        path: 'question-sets/:question_set_id',
        loadChildren: () => QuestionSetModule
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
