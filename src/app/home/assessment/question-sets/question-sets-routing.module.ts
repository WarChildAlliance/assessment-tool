import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { QuestionComponent } from './components/question/question.component';
import { QuestionSetsComponent } from './question-sets.component';
import { QuestionSetIntroComponent } from './components/question-set-intro/question-set-intro.component';
import { CanDeactivateGuard } from '../../../core/guards/can-deactivate.guard';

const routes: Routes = [
    {
        path: '',
        component: QuestionSetsComponent
    },
    {
        path: 'intro',
        component: QuestionSetIntroComponent
    },
    {
        path: 'questions/:question_id',
        component: QuestionComponent,
        canDeactivate: [CanDeactivateGuard]
    },
    {
        path: '**',
        redirectTo: '',
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    providers: [CanDeactivateGuard],
    exports: [RouterModule]
})
export class QuestionSetsRoutingModule {
}
