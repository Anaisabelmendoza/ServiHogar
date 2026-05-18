import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: 'home',
    loadChildren: () => import('./home/home.module').then( m => m.HomePageModule)
  },
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: 'login',
    loadChildren: () => import('./login/login.module').then( m => m.LoginPageModule)
  },
  {
    path: 'forgot-password',
    loadChildren: () => import('./forgot-password/forgot-password.module').then( m => m.ForgotPasswordPageModule)
  },
  {
    path: 'reset-password',
    loadChildren: () => import('./reset-password/reset-password.module').then( m => m.ResetPasswordPageModule)
  },
  {
    path: 'success-recovery',
    loadChildren: () => import('./success-recovery/success-recovery.module').then( m => m.SuccessRecoveryPageModule)
  },
  {
    path: 'register-selection',
    loadChildren: () => import('./register-selection/register-selection.module').then( m => m.RegisterSelectionPageModule)
  },
  {
    path: 'register-client',
    loadChildren: () => import('./register-client/register-client.module').then( m => m.RegisterClientPageModule)
  },
  {
    path: 'register-worker',
    loadChildren: () => import('./register-worker/register-worker.module').then( m => m.RegisterWorkerPageModule)
  },
  {
    path: 'service-request',
    loadChildren: () => import('./service-request/service-request.module').then( m => m.ServiceRequestPageModule)
  },
  {
    path: 'service-description',
    loadChildren: () => import('./service-description/service-description.module').then( m => m.ServiceDescriptionPageModule)
  },
  {
    path: 'professional-selection',
    loadChildren: () => import('./professional-selection/professional-selection.module').then( m => m.ProfessionalSelectionPageModule)
  },
  {
    path: 'service-tracking',
    loadChildren: () => import('./service-tracking/service-tracking.module').then( m => m.ServiceTrackingPageModule)
  },
  {
    path: 'review',
    loadChildren: () => import('./review/review.module').then( m => m.ReviewPageModule)
  },
  {
    path: 'report-problem',
    loadChildren: () => import('./report-problem/report-problem.module').then( m => m.ReportProblemPageModule)
  },
  {
    path: 'profile',
    loadChildren: () => import('./profile/profile.module').then( m => m.ProfilePageModule)
  },
  {
    path: 'appointments-history',
    loadChildren: () => import('./appointments-history/appointments-history.module').then( m => m.AppointmentsHistoryPageModule)
  },
  {
    path: 'worker-home',
    loadChildren: () => import('./worker-home/worker-home.module').then( m => m.WorkerHomePageModule)
  },
  {
    path: 'worker-job-detail',
    loadChildren: () => import('./worker-job-detail/worker-job-detail.module').then( m => m.WorkerJobDetailPageModule)
  },
  {
    path: 'worker-working',
    loadChildren: () => import('./worker-working/worker-working.module').then( m => m.WorkerWorkingPageModule)
  },
  {
    path: 'worker-review',
    loadChildren: () => import('./worker-review/worker-review.module').then( m => m.WorkerReviewPageModule)
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
