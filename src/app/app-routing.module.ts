import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';
import { UserResolver } from './core/resolvers/user.resolver';

const routes: Routes = [
  {
    path: 'auth',
    loadChildren: () => import('./auth/auth.module')
      .then(m => m.AuthModule),
    canLoad: [AuthGuard]
  },
  {
    path: 'home',
    loadChildren: () => import('./home/home.module')
      .then(m => m.HomeModule),
    canLoad: [AuthGuard],
    resolve: { user: UserResolver }
  },
  {
    path: 'assessments/:assessment_id',
    loadChildren: () => import('./assessment/assessment.module')
      .then(m => m.AssessmentModule),
    canLoad: [AuthGuard],
    resolve: { user: UserResolver }
  },
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full'
  },
  {
    path: '**',
    redirectTo: 'home'
  }
];


@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})



export class AppRoutingModule {
}
