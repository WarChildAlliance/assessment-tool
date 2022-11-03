import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { IntroGuard } from '../intro.guard';
import { AssessmentModule } from './assessment/assessment.module';
import { HomeComponent } from './home.component';
import { ProfileModule } from './profile/profile.module';

const routes: Routes = [
  {
    path: 'profile',
    loadChildren: () => ProfileModule
  },
  {
    path: 'assessments/:subject/:assessment_id',
    loadChildren: () => AssessmentModule
  },
  {
    path: '',
    component: HomeComponent,
    canActivate: [IntroGuard]
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
export class HomeRoutingModule { }
