import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthModule } from './auth/auth.module';
import { AuthGuard } from './core/guards/auth.guard';
import { UserResolver } from './core/resolvers/user.resolver';
import { HomeModule } from './home/home.module';

const routes: Routes = [
  {
    path: 'auth',
    loadChildren: () => AuthModule,
    canLoad: [AuthGuard]
  },
  {
    path: '',
    loadChildren: () => HomeModule,
    canLoad: [AuthGuard],
    resolve: { user: UserResolver }
  },
  {
    path: '**',
    redirectTo: 'home'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {
    paramsInheritanceStrategy: 'always'
})],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
