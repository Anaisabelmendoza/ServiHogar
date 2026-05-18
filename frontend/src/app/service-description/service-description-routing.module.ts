import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ServiceDescriptionPage } from './service-description.page';

const routes: Routes = [
  {
    path: '',
    component: ServiceDescriptionPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ServiceDescriptionPageRoutingModule {}
