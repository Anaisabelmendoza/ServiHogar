import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { WorkerReviewPage } from './worker-review.page';

const routes: Routes = [
  {
    path: '',
    component: WorkerReviewPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class WorkerReviewPageRoutingModule {}
