import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AppointmentsHistoryPage } from './appointments-history.page';

const routes: Routes = [
  {
    path: '',
    component: AppointmentsHistoryPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AppointmentsHistoryPageRoutingModule {}
