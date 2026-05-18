import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ProfessionalSelectionPageRoutingModule } from './professional-selection-routing.module';

import { ProfessionalSelectionPage } from './professional-selection.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ProfessionalSelectionPageRoutingModule
  ],
  declarations: [ProfessionalSelectionPage]
})
export class ProfessionalSelectionPageModule {}
