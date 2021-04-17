import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthModule } from './components/auth/auth.module';
import { AssessmentsComponent } from './components/assessments/assessments.component';
import { AssessmentComponent } from './components/assessments/components/assessment/assessment.component';
import { AuthComponent } from './components/auth/auth.component';
//import { AuthGuard } from './core/guards/auth.guard';

const routes: Routes = [
  {
    path: 'auth',
    component: AuthComponent,
      //canLoad: [AuthGuard]
  },
  {
    path: 'assessments',
    component: AssessmentsComponent,
    //canLoad: [AuthGuard]
  },
  {
    path: 'assessments/:name',
    component: AssessmentComponent,
      //canLoad: [AuthGuard]
  },
  {
    path: '',
    redirectTo: 'auth',
    pathMatch: 'full'
  },
  {
    path: '**',
    redirectTo: 'auth', //TODO change to assessments when auth guard in place
  }
];


@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})



export class AppRoutingModule { 
}
