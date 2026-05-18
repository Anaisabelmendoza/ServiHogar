import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SuccessRecoveryPage } from './success-recovery.page';

const routes: Routes = [
  {
    path: '',
    component: SuccessRecoveryPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SuccessRecoveryPageRoutingModule {}
