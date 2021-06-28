import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CompletedTopicComponent } from './components/completed-topic/completed-topic.component';
import { QuestionComponent } from './components/question/question.component';
import { TopicComponent } from './topic.component';
import { CanDeactivateGuard } from '../../../core/guards/can-deactivate.guard';

const routes: Routes = [
    {
        path: '',
        component: TopicComponent
    },
    {
        path: 'questions/:question_id',
        component: QuestionComponent,
        canDeactivate: [CanDeactivateGuard]
    },
    {
        path: 'completed',
        canDeactivate: [CanDeactivateGuard],
        component: CompletedTopicComponent
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
export class TopicRoutingModule {
}
