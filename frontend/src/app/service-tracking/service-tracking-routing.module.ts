import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ServiceTrackingPage } from './service-tracking.page';

const routes: Routes = [
  {
    path: '',
    component: ServiceTrackingPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ServiceTrackingPageRoutingModule {}
