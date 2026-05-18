import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { WorkerJobDetailPage } from './worker-job-detail.page';

const routes: Routes = [
  {
    path: '',
    component: WorkerJobDetailPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class WorkerJobDetailPageRoutingModule {}
