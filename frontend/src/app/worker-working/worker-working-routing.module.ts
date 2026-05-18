import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { WorkerWorkingPage } from './worker-working.page';

const routes: Routes = [
  {
    path: '',
    component: WorkerWorkingPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class WorkerWorkingPageRoutingModule {}
