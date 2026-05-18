import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AppointmentsHistoryPageRoutingModule } from './appointments-history-routing.module';

import { AppointmentsHistoryPage } from './appointments-history.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AppointmentsHistoryPageRoutingModule
  ],
  declarations: [AppointmentsHistoryPage]
})
export class AppointmentsHistoryPageModule {}
