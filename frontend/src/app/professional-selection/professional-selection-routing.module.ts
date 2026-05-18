import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ProfessionalSelectionPage } from './professional-selection.page';

const routes: Routes = [
  {
    path: '',
    component: ProfessionalSelectionPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ProfessionalSelectionPageRoutingModule {}
