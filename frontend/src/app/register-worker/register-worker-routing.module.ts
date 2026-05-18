import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { RegisterWorkerPage } from './register-worker.page';

const routes: Routes = [
  {
    path: '',
    component: RegisterWorkerPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class RegisterWorkerPageRoutingModule {}
