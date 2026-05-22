import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { authGuard, clientGuard, workerGuard, guestGuard } from './guards/auth.guard';

const routes: Routes = [
  {
    path: 'home',
    loadChildren: () => import('./home/home.module').then( m => m.HomePageModule),
    canActivate: [authGuard, clientGuard]
  },
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: 'login',
    loadChildren: () => import('./login/login.module').then( m => m.LoginPageModule),
    canActivate: [guestGuard]
  },
  {
    path: 'forgot-password',
    loadChildren: () => import('./forgot-password/forgot-password.module').then( m => m.ForgotPasswordPageModule),
    canActivate: [guestGuard]
  },
  {
    path: 'reset-password',
    loadChildren: () => import('./reset-password/reset-password.module').then( m => m.ResetPasswordPageModule),
    canActivate: [guestGuard]
  },
  {
    path: 'success-recovery',
    loadChildren: () => import('./success-recovery/success-recovery.module').then( m => m.SuccessRecoveryPageModule),
    canActivate: [guestGuard]
  },
  {
    path: 'register-selection',
    loadChildren: () => import('./register-selection/register-selection.module').then( m => m.RegisterSelectionPageModule),
    canActivate: [guestGuard]
  },
  {
    path: 'register-client',
    loadChildren: () => import('./register-client/register-client.module').then( m => m.RegisterClientPageModule),
    canActivate: [guestGuard]
  },
  {
    path: 'register-worker',
    loadChildren: () => import('./register-worker/register-worker.module').then( m => m.RegisterWorkerPageModule),
    canActivate: [guestGuard]
  },
  {
    path: 'service-request',
    loadChildren: () => import('./service-request/service-request.module').then( m => m.ServiceRequestPageModule),
    canActivate: [authGuard, clientGuard]
  },
  {
    path: 'service-description',
    loadChildren: () => import('./service-description/service-description.module').then( m => m.ServiceDescriptionPageModule),
    canActivate: [authGuard, clientGuard]
  },
  {
    path: 'professional-selection',
    loadChildren: () => import('./professional-selection/professional-selection.module').then( m => m.ProfessionalSelectionPageModule),
    canActivate: [authGuard, clientGuard]
  },
  {
    path: 'service-tracking',
    loadChildren: () => import('./service-tracking/service-tracking.module').then( m => m.ServiceTrackingPageModule),
    canActivate: [authGuard, clientGuard]
  },
  {
    path: 'review',
    loadChildren: () => import('./review/review.module').then( m => m.ReviewPageModule),
    canActivate: [authGuard, clientGuard]
  },
  {
    path: 'report-problem',
    loadChildren: () => import('./report-problem/report-problem.module').then( m => m.ReportProblemPageModule),
    canActivate: [authGuard]
  },
  {
    path: 'profile',
    loadChildren: () => import('./profile/profile.module').then( m => m.ProfilePageModule),
    canActivate: [authGuard]
  },
  {
    path: 'appointments-history',
    loadChildren: () => import('./appointments-history/appointments-history.module').then( m => m.AppointmentsHistoryPageModule),
    canActivate: [authGuard, clientGuard]
  },
  {
    path: 'worker-home',
    loadChildren: () => import('./worker-home/worker-home.module').then( m => m.WorkerHomePageModule),
    canActivate: [authGuard, workerGuard]
  },
  {
    path: 'worker-job-detail',
    loadChildren: () => import('./worker-job-detail/worker-job-detail.module').then( m => m.WorkerJobDetailPageModule),
    canActivate: [authGuard, workerGuard]
  },
  {
    path: 'worker-working',
    loadChildren: () => import('./worker-working/worker-working.module').then( m => m.WorkerWorkingPageModule),
    canActivate: [authGuard, workerGuard]
  },
  {
    path: 'worker-review',
    loadChildren: () => import('./worker-review/worker-review.module').then( m => m.WorkerReviewPageModule),
    canActivate: [authGuard, workerGuard]
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
