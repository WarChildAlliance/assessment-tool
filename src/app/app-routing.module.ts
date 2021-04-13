import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthModule } from './components/auth/auth.module'
import { AssessmentsModule } from './components/assessments/assessments.module'
//import { AuthGuard } from './core/guards/auth.guard';

const routes: Routes = [
  {
    path: 'auth',
    loadChildren: () => import('./components/auth/auth.module')
      .then(m => m.AuthModule),
      //canLoad: [AuthGuard]
  },
  {
    path: 'assessments',
    loadChildren: () => import('./components/assessments/assessments.module')
      .then(m => m.AssessmentsModule),
    //canLoad: [AuthGuard]
  },
  {
    path: '',
    redirectTo: 'auth', //TODO change later to assessments
    pathMatch: 'full'
  },
  {
    path: '**',
    redirectTo: 'assessments', 
    pathMatch: 'full'
  }
];


@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})



export class AppRoutingModule { 
}
