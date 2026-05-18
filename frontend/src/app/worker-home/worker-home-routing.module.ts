import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { WorkerHomePage } from './worker-home.page';

const routes: Routes = [
  {
    path: '',
    component: WorkerHomePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class WorkerHomePageRoutingModule {}
